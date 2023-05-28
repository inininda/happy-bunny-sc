// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract HappyBunny is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;
    using ECDSA for bytes32;
    using Counters for Counters.Counter;

    address public constant TREASURY_WALLET =
        0x123; //please change
    uint256 public constant MAX_SUPPLY = 1001;
    uint256 public constant AUCTION_SUPPLY = 1;
    uint256 public constant SALE_SUPPLY = 1000;

    address private signerAddress;
    string public baseURI;
    Counters.Counter public totalSupply;
    Counters.Counter public burnCounter;
    Counters.Counter public mintBurnCounter;

    // Auction
    uint256 public auctionAmountMinted;

    // Pre-Sale
    uint256 public mintPrice = 0.2 ether;
    mapping(address => uint256) public mintClaimed;
    bytes32 private merkleRoot;
    uint256 public saleAmountMinted;
    bool public isPreSaleLive;
    uint256 public constant PUBLIC_SALE_MINT_LIMIT = 1;
    bool public isPublicSaleLive;

    // Custom Errors
    error DirectMintFromContractNotAllowed();
    error PreSaleInactive();
    error InsufficientETHSent();
    error ExceedsAllocationForMint();
    error NotOnWhitelist();
    error PublicSaleInactive();
    error ExceedsMaxSupply();
    error ExceedsAllocationForAuction();
    error DirectMintFromBotNotAllowed();
    error WithdrawalFailed();
    error SalesStillActive();
    error CollectionMintedOut();
    error NoSupplyToBurn();
    error PreSaleStillActive();
    error PublicSaleStillActive();

    // Events
    event Minted(uint256 remainingSupply);

    // Modifiers
    modifier callerIsUser() {
        if (tx.origin != msg.sender) revert DirectMintFromContractNotAllowed();
        _;
    }

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    function getRemainingSupply() public view returns (uint256) {
        unchecked {
            return MAX_SUPPLY - totalSupply.current();
        }
    }

    function auctionMint() external onlyOwner nonReentrant {
        if (auctionAmountMinted + 1 > AUCTION_SUPPLY)
            revert ExceedsAllocationForAuction();

        totalSupply.increment();
        _mint(msg.sender, totalSupply.current());
        unchecked {
            auctionAmountMinted += 1;
        }
        emit Minted(getRemainingSupply());
    }

    function preSaleBuy(
        bytes32[] memory _merkleproof,
        uint256 allowedMintQuantity,
        uint256 mintQuantity
    ) external payable nonReentrant callerIsUser {
        if (!isPreSaleLive || isPublicSaleLive) revert PreSaleInactive();

        if (saleAmountMinted + mintQuantity > SALE_SUPPLY)
            revert ExceedsMaxSupply();

        if (mintClaimed[msg.sender] + mintQuantity > allowedMintQuantity)
            revert ExceedsAllocationForMint();

        bytes32 leaf = keccak256(
            abi.encodePacked(msg.sender, allowedMintQuantity)
        );

        if (!MerkleProof.verify(_merkleproof, merkleRoot, leaf))
            revert NotOnWhitelist();

        if (msg.value < mintPrice * mintQuantity) revert InsufficientETHSent();

        unchecked {
            saleAmountMinted += mintQuantity;
            mintClaimed[msg.sender] += mintQuantity;
        }

        for (uint256 i; i < mintQuantity; ) {
            totalSupply.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked {
                ++i;
            }
        }

        emit Minted(getRemainingSupply());
    }

    function publicSaleBuy(bytes calldata signature)
        external
        payable
        nonReentrant
        callerIsUser
    {
        if (!isPublicSaleLive) revert PublicSaleInactive();

        if (
            saleAmountMinted + 1 > SALE_SUPPLY ||
            totalSupply.current() + 1 > MAX_SUPPLY
        ) revert ExceedsMaxSupply();

        if (mintClaimed[msg.sender] + 1 > PUBLIC_SALE_MINT_LIMIT)
            revert ExceedsAllocationForMint();

        if (!matchAddresSigner(hashTransaction(msg.sender), signature))
            revert DirectMintFromBotNotAllowed();

        if (msg.value < mintPrice) revert InsufficientETHSent();

        unchecked {
            saleAmountMinted += 1;
            mintClaimed[msg.sender] += 1;
        }

        totalSupply.increment();
        _mint(msg.sender, totalSupply.current());

        emit Minted(getRemainingSupply());
    }

    function matchAddresSigner(bytes32 hash, bytes memory signature)
        private
        view
        returns (bool)
    {
        return signerAddress == hash.recover(signature);
    }

    function hashTransaction(address sender) private pure returns (bytes32) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(sender))
            )
        );
        return hash;
    }

    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = payable(TREASURY_WALLET).call{
            value: address(this).balance
        }("");
        if (!success) revert WithdrawalFailed();
    }

    function togglePreSaleStatus() external onlyOwner {
        if (isPublicSaleLive) {
            revert PublicSaleStillActive();
        }

        isPreSaleLive = !isPreSaleLive;
    }

    function togglePublicSaleStatus() external onlyOwner {
        if (isPreSaleLive) {
            revert PreSaleStillActive();
        }

        isPublicSaleLive = !isPublicSaleLive;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string calldata _uri) external onlyOwner {
        baseURI = _uri;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function setMintPrice(uint256 _price) external onlyOwner {
        mintPrice = _price;
    }

    function setSignerAddress(address _signerAddress) external onlyOwner {
        signerAddress = _signerAddress;
    }

    function mintRemainingSupply() external onlyOwner nonReentrant {
        // only mint remaining supply when presale and publicSale is inactive
        if (isPreSaleLive || isPublicSaleLive) revert SalesStillActive();

        // unable to mint remaining supply if collection has minted out
        if (totalSupply.current() + mintBurnCounter.current() == MAX_SUPPLY)
            revert CollectionMintedOut();

        // mint the remaining supply to burn afterwards
        uint256 supplyLeft = getRemainingSupply();
        for (uint256 i; i < supplyLeft; ) {
            totalSupply.increment();

            // counter to keep track of how many tokens to burn
            burnCounter.increment();
            _mint(msg.sender, totalSupply.current());
            unchecked {
                ++i;
            }
        }
    }

    function burnRemainingSupply() external onlyOwner nonReentrant {
        // only mint remaining supply when presale and publicSale is inactive
        if (isPreSaleLive || isPublicSaleLive) revert SalesStillActive();

        // unable to burn remain supply if collection has NOT minted out
        if (totalSupply.current() < MAX_SUPPLY || burnCounter.current() == 0)
            revert NoSupplyToBurn();

        uint256 burnLength = burnCounter.current();
        for (uint256 b; b < burnLength; ) {
            _burn(totalSupply.current());
            totalSupply.decrement();
            burnCounter.decrement();
            mintBurnCounter.increment();
            unchecked {
                ++b;
            }
        }
    }
}
