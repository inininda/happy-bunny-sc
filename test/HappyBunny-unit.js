const { expect } = require('chai');
const { ethers } = require('hardhat');
//const { describe } = require('yargs');

const {
  generateRandomHex,
  completeAuctionMint,
  completePreSaleBuy,
  completePublicSaleBuy,
  getTestWLData,
  getTestDAData,
  verifyRemainingSupply,
  daSignatures
} = require('./utilities');

describe("HappyBunny", function () {
  let contractOwner
  beforeEach(async function () {
    this.accounts = await ethers.getSigners();
    const [owner] = await ethers.getSigners();
    this.owner = owner.address;
    contractOwner = owner.address;
    this.provider = ethers.provider;

    const HappyBunny = await ethers.getContractFactory('HappyBunny');
    this.HappyBunnycontract = await HappyBunny.deploy('Happy Bunny', 'HB');
    await this.HappyBunnycontract.deployed();

    // Test accounts
    this.account0 = getTestWLData(this.accounts[0].address);
    this.account1 = getTestWLData(this.accounts[1].address);
    this.account2 = getTestWLData(this.accounts[2].address);
    this.account3 = getTestWLData(this.accounts[3].address);
  });

  // describe('getRemainingSupply()', function () {
  //   it('Should return the balance of supply', async function () {
  //     await completeAuctionMint(this.HappyBunnycontract);
  //     const totalSupply = await this.HappyBunnycontract.totalSupply()

  //     expect(totalSupply.toNumber()).to.equal(1);
  //     expect(parseInt((await this.HappyBunnycontract.getRemainingSupply()).toString())).to.equal(
  //       (await this.HappyBunnycontract.MAX_SUPPLY()) - totalSupply
  //     );
  //   });
  // });

  describe('auctionMint', function(){
    it('should allow auction minting if not minted', async function (){
      await completeAuctionMint(this.HappyBunnycontract,contractOwner)
      await verifyRemainingSupply(this.HappyBunnycontract,await this.HappyBunnycontract.AUCTION_SUPPLY())
    })

    it('should not allow auction minting if already minted all auction supply', async function (){
      await completeAuctionMint(this.HappyBunnycontract,contractOwner)
      await verifyRemainingSupply(this.HappyBunnycontract,await this.HappyBunnycontract.AUCTION_SUPPLY())
      await expect(completeAuctionMint(this.HappyBunnycontract,contractOwner)).to.be.revertedWith(
        'ExceedsAllocationForAuction()'
      );
    })
  })

  describe('preSaleBuy()', function () {
    beforeEach(async function () {
      //mint auction first
      await completeAuctionMint(this.HappyBunnycontract,contractOwner)
      this.auctionMintQty = await this.HappyBunnycontract.balanceOf(contractOwner)
      this.mintPrice = await this.HappyBunnycontract.mintPrice();
      this.HappyBunnycontract.setMerkleRoot(
        '0xf13a391f6d2671c1790bb6c75c2d0f112183d1ede45f85b773ea203222a44974'
      );
      this.HappyBunnycontract.togglePreSaleStatus();
    });

    // Minting from contract should fail as merkle proof probably can't be provided - Handle with merkle proof check

    it('Should allow minting if has allocated WL and quanitity', async function () {
      await this.HappyBunnycontract
        .connect(this.accounts[1])
        .preSaleBuy(this.account1.merkleProof, this.account1.allowedQuantity,  this.account1.allowedQuantity, {
          value: String(this.mintPrice * 1),
        });

      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(this.account1.allowedQuantity) + parseInt(this.auctionMintQty))
      const balance = await this.HappyBunnycontract.balanceOf(this.accounts[1].address);
      expect(parseInt(balance.toString())).to.equal(this.account1.allowedQuantity);
    });

    it('Should not allow minting if pre-sale has not started', async function () {
      // Toggle pre-sale to stop
      this.HappyBunnycontract.togglePreSaleStatus();
      await expect(
        this.HappyBunnycontract
          .connect(this.accounts[1])
          .preSaleBuy(this.account1.merkleProof, this.account1.allowedQuantity, 1, {
            value: String(this.mintPrice * 1),
          })
      ).to.be.revertedWith('PreSaleInactive()');
      await verifyRemainingSupply(this.HappyBunnycontract, this.auctionMintQty);
    });

    it('Should not allow minting if current mint will exceed limit', async function () {
      // Mint 15
      await completePreSaleBuy(
        this.HappyBunnycontract,
        this.accounts[0],
        this.account0.merkleProof,
        this.account0.allowedQuantity,
        this.account0.allowedQuantity
      );

      const mintQuantity =
        (await this.HappyBunnycontract.SALE_SUPPLY()) -
        (await this.HappyBunnycontract.saleAmountMinted()) +
        1;
      await expect(
        this.HappyBunnycontract
          .connect(this.accounts[1])
          .preSaleBuy(this.account1.merkleProof, this.account1.allowedQuantity, mintQuantity, {
            value: String(BigInt(this.mintPrice) * BigInt(mintQuantity)),
          })
      ).to.be.revertedWith('ExceedsMaxSupply()');
      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(await this.HappyBunnycontract.saleAmountMinted()) + parseInt(this.auctionMintQty));
    });

    it('Should not allow minting if already minted allocated WL amount', async function () {
      await expect(
        completePreSaleBuy(
          this.HappyBunnycontract,
          this.accounts[1],
          this.account1.merkleProof,
          this.account1.allowedQuantity,
          parseInt(this.account1.allowedQuantity)+1
        )
      ).to.be.revertedWith('ExceedsAllocationForMint()');
      await verifyRemainingSupply(this.HappyBunnycontract, this.auctionMintQty);
    });

    it('Should not allow minting if merkle proof is invalid', async function () {
      await expect(
        this.HappyBunnycontract
          .connect(this.accounts[1])
          .preSaleBuy(
            [
              '0xca0c263ef03ee9a684ef0aa61b1e13332d2e9aa088769eb794d5b463a634bebe',
              '0x31403139b3e99fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57',
            ],
            this.account1.allowedQuantity,
            this.account1.allowedQuantity,
            {
              value: String(this.mintPrice * 1),
            }
          )
      ).to.be.revertedWith('NotOnWhitelist()');
      await verifyRemainingSupply(this.HappyBunnycontract, this.auctionMintQty);
    });

    it('Should not allow minting if not enough ETH sent', async function () {
      await expect(
        this.HappyBunnycontract
          .connect(this.accounts[1])
          .preSaleBuy(this.account1.merkleProof, this.account1.allowedQuantity, this.account1.allowedQuantity, {
            value: String(this.mintPrice * 0.2),
          })
      ).to.be.revertedWith('InsufficientETHSent()');
      await verifyRemainingSupply(this.HappyBunnycontract, this.auctionMintQty);
    });

  });

  describe('publicSaleBuy()', function () {
    beforeEach(async function () {
      //mint auction first
      await completeAuctionMint(this.HappyBunnycontract,contractOwner)
      this.auctionMintQty = await this.HappyBunnycontract.balanceOf(contractOwner)
      this.mintPrice= await this.HappyBunnycontract.mintPrice();
      this.HappyBunnycontract.togglePublicSaleStatus();
      await this.HappyBunnycontract.setSignerAddress('0x978D5cc8d783F4c8C0497DAa8F727723243e5B2b');
    });

    it('Should allow minting public sale', async function () {
      await this.HappyBunnycontract.connect(this.accounts[2]).publicSaleBuy(daSignatures[2], {
        value: String(this.mintPrice * 1),
      });
      const balance = await this.HappyBunnycontract.balanceOf(this.accounts[2].address);
      expect(parseInt(balance)).to.equal(1);
      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(this.auctionMintQty) + 1);
    });

    it('Should not allow minting if public sale has not started', async function () {
      // Stop public sale
      this.HappyBunnycontract.togglePublicSaleStatus();
      await expect(completePublicSaleBuy(this.HappyBunnycontract, this.accounts, 1)).to.be.revertedWith(
        'PublicSaleInactive()'
      );
      await verifyRemainingSupply(this.HappyBunnycontract, this.auctionMintQty);
    });

    it('Should not allow minting if there is no more supply', async function () {
      this.HappyBunnycontract.togglePublicSaleStatus();
      //mint all remaining supply
      await this.HappyBunnycontract.mintRemainingSupply()
      this.HappyBunnycontract.togglePublicSaleStatus();
      await expect(completePublicSaleBuy(this.HappyBunnycontract, this.accounts, 1)).to.be.revertedWith(
        'ExceedsMaxSupply()'
      );
      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(await this.HappyBunnycontract.burnCounter()) + parseInt(this.auctionMintQty));
    });

    it('Should not allow minting if not enough ETH sent', async function () {
      await expect(
        this.HappyBunnycontract.connect(this.accounts[1]).publicSaleBuy(getTestDAData(1), {
          value: String(this.mintPrice * 0.5),
        })
      ).to.be.revertedWith('InsufficientETHSent()');
      await verifyRemainingSupply(this.HappyBunnycontract, this.auctionMintQty);
    });
  });

  describe('Scenerio: WListee mint publicSaleBuy()', function () {
    beforeEach(async function () {
      //mint auction first
      await completeAuctionMint(this.HappyBunnycontract,contractOwner)
      this.auctionMintQty = await this.HappyBunnycontract.balanceOf(contractOwner)
      this.mintPrice= await this.HappyBunnycontract.mintPrice();
      this.HappyBunnycontract.setMerkleRoot(
        '0xf13a391f6d2671c1790bb6c75c2d0f112183d1ede45f85b773ea203222a44974'
      );
      await this.HappyBunnycontract.setSignerAddress('0x978D5cc8d783F4c8C0497DAa8F727723243e5B2b');
    });

    it('Should not allow minting if user has already minted during WL', async function () {

      // turn on presale live
      this.HappyBunnycontract.togglePreSaleStatus();

      // mint 1 during presale
      await this.HappyBunnycontract
        .connect(this.accounts[1])
        .preSaleBuy(this.account1.merkleProof, this.account1.allowedQuantity, this.account1.allowedQuantity, {
          value: String(this.mintPrice * parseInt(this.account1.allowedQuantity)),
        });

      // turn off presale live
      this.HappyBunnycontract.togglePreSaleStatus();

      // turn on public live
      this.HappyBunnycontract.togglePublicSaleStatus();
      await expect(this.HappyBunnycontract.connect(this.accounts[1]).publicSaleBuy(getTestDAData(1), {value: String(this.mintPrice)})
      ).to.be.revertedWith('ExceedsAllocationForMint()');
      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(this.account1.allowedQuantity) + parseInt(this.auctionMintQty));
    });

    it('Should allow minting if user has not minted during WL', async function () {

      // turn on public live
      this.HappyBunnycontract.togglePublicSaleStatus();

      await this.HappyBunnycontract.connect(this.accounts[3]).publicSaleBuy(daSignatures[3], {
        value: String(this.mintPrice * 1),
      });
      const balance = await this.HappyBunnycontract.balanceOf(this.accounts[3].address);
      expect(parseInt(balance)).to.equal(1);
      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(this.auctionMintQty) + 1);
    });

  });

  describe('togglePreSaleStatus()', function () {
    it('Should allow toggling of pre-sale status', async function () {
      let preSaleStatus = await this.HappyBunnycontract.isPreSaleLive();
      expect(preSaleStatus).to.be.false;

      // Toggle sale state on
      this.HappyBunnycontract.togglePreSaleStatus();

      preSaleStatus = await this.HappyBunnycontract.isPreSaleLive();
      expect(preSaleStatus).to.be.true;
    });

    it('Should not allow toggling of pre-sale status if public sale is live', async function(){
      this.HappyBunnycontract.togglePublicSaleStatus();
      await expect(this.HappyBunnycontract.togglePreSaleStatus()).to.be.revertedWith(
        'PublicSaleStillActive()'
      );
    })
  });

  describe('togglePublicSaleStatus()', function () {
    it('Should allow toggling of pre-sale status', async function () {
      let publicSaleStatus = await this.HappyBunnycontract.isPublicSaleLive();
      expect(publicSaleStatus).to.be.false;

      // Toggle sale state on
      this.HappyBunnycontract.togglePublicSaleStatus();

      publicSaleStatus = await this.HappyBunnycontract.isPublicSaleLive();
      expect(publicSaleStatus).to.be.true;
    });

    it('Should not allow toggling of public sale status if pre-sale is live', async function(){
      this.HappyBunnycontract.togglePreSaleStatus();
      await expect(this.HappyBunnycontract.togglePublicSaleStatus()).to.be.revertedWith(
        'PreSaleStillActive()'
      );
    })
  });

  describe('setBaseURI()', function () {
    it('Should allow setting of URI', async function () {
      const newBaseURI = 'https://io.mypinata.cloud/ipfs/ipfs-hash/';
      this.HappyBunnycontract.setBaseURI(newBaseURI);
      let tokenBaseURIAfter = await this.HappyBunnycontract.baseURI();
      expect(tokenBaseURIAfter).to.equal(newBaseURI);
    });
  });

  describe('_baseURI()', function () {
    it('Should allow getting of base URI', async function () {
      let baseURI = await this.HappyBunnycontract.baseURI();
      expect(baseURI).to.equal('');
    });
  });

  /*describe('getMerkleRoot()', function () {
    it('Should allow getting of Merkle Root', async function () {
      let merkleRoot = await this.HappyBunnycontract.getMerkleRoot();
      expect(ethers.utils.hexlify(merkleRoot)).to.equal(
        ethers.utils.hexlify('0x0000000000000000000000000000000000000000000000000000000000000000')
      );
    });
  });*/

  describe('setMerkleRoot()', function () {
    it('Should allow setting of Merkle Root', async function () {
      // Generate random merkle root
      let randomMerkleRoot = '0x' + generateRandomHex(64);
      this.HappyBunnycontract.setMerkleRoot(randomMerkleRoot);

      /*let merkleRootAfter = await this.HappyBunnycontract.getMerkleRoot();
      expect(ethers.utils.hexlify(merkleRootAfter)).to.equal(
        ethers.utils.hexlify(randomMerkleRoot)
      );*/

    });
  });

  describe('setMintPrice()', function () {
    it('Should allow setting of pre-sale price', async function () {
      const newPresalePrice = '0.05';
      this.HappyBunnycontract.setMintPrice(ethers.utils.parseEther(newPresalePrice));
      let preSalePriceAfter = await this.HappyBunnycontract.mintPrice();
      expect(parseFloat(ethers.utils.formatEther(preSalePriceAfter))).to.equal(
        parseFloat(newPresalePrice)
      );
    });
  });

  describe('withdraw()', function () {
    it('Should allow withdrawing of entire balance to wallet', async function () {
      // Simulate some mints with value
      this.HappyBunnycontract.togglePreSaleStatus();
      this.HappyBunnycontract.setMerkleRoot(
        '0xf13a391f6d2671c1790bb6c75c2d0f112183d1ede45f85b773ea203222a44974'
      );
      //await completeAuctionMint(this.HappyBunnycontract)

      // Mint 21 quantity across different accounts
      await completePreSaleBuy(
        this.HappyBunnycontract,
        this.accounts[0],
        this.account0.merkleProof,
        this.account0.allowedQuantity,
        15
      );
      await completePreSaleBuy(
        this.HappyBunnycontract,
        this.accounts[1],
        this.account1.merkleProof,
        this.account1.allowedQuantity,
        1
      );
      await completePreSaleBuy(
        this.HappyBunnycontract,
        this.accounts[2],
        this.account2.merkleProof,
        this.account2.allowedQuantity,
        2
      );
      await completePreSaleBuy(
        this.HappyBunnycontract,
        this.accounts[3],
        this.account3.merkleProof,
        this.account3.allowedQuantity,
        3
      );

      await verifyRemainingSupply(this.HappyBunnycontract, 21)

      const contractBalanceBefore = await this.provider.getBalance(this.HappyBunnycontract.address);
      // Balance in contract should have balance for 21 minted
      expect(contractBalanceBefore.toBigInt()).to.equal(
        BigInt(21 * (await this.HappyBunnycontract.mintPrice()))
      );

      const txn = await this.HappyBunnycontract.withdraw();
      const contractBalanceAfter = await this.provider.getBalance(this.HappyBunnycontract.address);
      const walletBalance = await this.provider.getBalance(this.HappyBunnycontract.TREASURY_WALLET());
      // Balance in contract should be empty
      expect(contractBalanceAfter.toNumber()).to.equal(0);
      // Balance shuould be in TREASURY_WALLET
      expect(walletBalance.toBigInt()).to.equal(contractBalanceBefore.toBigInt());
    });
  });

  describe('mintRemainingSupply()', function(){
    beforeEach(async function () {
      //mint auction first
      await completeAuctionMint(this.HappyBunnycontract,contractOwner)
      this.auctionMintQty = await this.HappyBunnycontract.balanceOf(contractOwner)
    });

    it('should allow mint remaining supply when presale and publicSale is inactive', async function(){
      //await completeAuctionMint(this.HappyBunnycontract)
      await this.HappyBunnycontract.mintRemainingSupply()
      const remaniningSupplyMinted = parseInt(await this.HappyBunnycontract.SALE_SUPPLY()) + parseInt(this.auctionMintQty);

      await verifyRemainingSupply(this.HappyBunnycontract, remaniningSupplyMinted)

    })

    it('should not allow mint remaining supply if pre sale or public sale live', async function(){
      this.HappyBunnycontract.togglePreSaleStatus();
      this.HappyBunnycontract.togglePublicSaleStatus();
      await expect(this.HappyBunnycontract.mintRemainingSupply()).to.be.revertedWith(
        'SalesStillActive()'
      );
      await verifyRemainingSupply(this.HappyBunnycontract, this.auctionMintQty)
    })

    it('should not allow mint remaining supply if current mint exceed MAX SUPPLY', async function(){
      await this.HappyBunnycontract.mintRemainingSupply()
      const remaniningSupplyMinted = parseInt(this.auctionMintQty) + parseInt(await this.HappyBunnycontract.SALE_SUPPLY());
      await expect(this.HappyBunnycontract.mintRemainingSupply()).to.be.revertedWith(
        'CollectionMintedOut()'
      );
      await verifyRemainingSupply(this.HappyBunnycontract, remaniningSupplyMinted)
    })
  })

  describe('burnRemainingSupply()', function(){
    beforeEach(async function () {
      //mint auction first
      await completeAuctionMint(this.HappyBunnycontract,contractOwner)
      this.auctionMintQty = await this.HappyBunnycontract.balanceOf(contractOwner)
    });
    it('should burn remaining supply when presale and public sale is inactive', async function(){
      await this.HappyBunnycontract.mintRemainingSupply()
      let remaniningSupplyMinted = await this.HappyBunnycontract.burnCounter()
      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(remaniningSupplyMinted) + parseInt(this.auctionMintQty))

      await this.HappyBunnycontract.burnRemainingSupply()
      remaniningSupplyMinted = await this.HappyBunnycontract.burnCounter()
      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(remaniningSupplyMinted) + parseInt(this.auctionMintQty))

    })

    it('should not allow burn remaining supply if pre sale or public sale live', async function(){
      const remaniningSupplyMinted = await this.HappyBunnycontract.burnCounter()
      //await completeAuctionMint(this.HappyBunnycontract)

      this.HappyBunnycontract.togglePreSaleStatus();
      this.HappyBunnycontract.togglePublicSaleStatus();
      await expect(this.HappyBunnycontract.burnRemainingSupply()).to.be.revertedWith(
        'SalesStillActive()'
      );
      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(remaniningSupplyMinted) + parseInt(this.auctionMintQty));

    })

    it('should not allow to burn if collection not minted out or no supply to be burn', async function(){
      const remaniningSupplyMinted = await this.HappyBunnycontract.burnCounter()

      await expect(this.HappyBunnycontract.burnRemainingSupply()).to.be.revertedWith(
        'NoSupplyToBurn()'
      );
      await verifyRemainingSupply(this.HappyBunnycontract, parseInt(remaniningSupplyMinted) + parseInt(this.auctionMintQty));
    })
  })

  describe('Scenerio: collection didnt sell out', function () {
    it('Should mint and burn remaining supply after public sale ends', async function () {
      // Simulate some mints with value
      this.HappyBunnycontract.togglePreSaleStatus();
      this.HappyBunnycontract.setMerkleRoot(
        '0xf13a391f6d2671c1790bb6c75c2d0f112183d1ede45f85b773ea203222a44974'
      );
      await //completeAuctionMint(this.HappyBunnycontract)

      // Mint 21 quantity across different accounts
      await completePreSaleBuy(
        this.HappyBunnycontract,
        this.accounts[0],
        this.account0.merkleProof,
        this.account0.allowedQuantity,
        15
      );
      await completePreSaleBuy(
        this.HappyBunnycontract,
        this.accounts[1],
        this.account1.merkleProof,
        this.account1.allowedQuantity,
        1
      );
      await completePreSaleBuy(
        this.HappyBunnycontract,
        this.accounts[2],
        this.account2.merkleProof,
        this.account2.allowedQuantity,
        2
      );
      await completePreSaleBuy(
        this.HappyBunnycontract,
        this.accounts[3],
        this.account3.merkleProof,
        this.account3.allowedQuantity,
        3
      );

      await verifyRemainingSupply(this.HappyBunnycontract, 21 )
      // off presale
      this.HappyBunnycontract.togglePreSaleStatus();

      await this.HappyBunnycontract.mintRemainingSupply()
      await verifyRemainingSupply(this.HappyBunnycontract, 21 + parseInt(await this.HappyBunnycontract.burnCounter()))

      await this.HappyBunnycontract.burnRemainingSupply()
      await verifyRemainingSupply(this.HappyBunnycontract, 21 + parseInt(await this.HappyBunnycontract.burnCounter()))

    });
  });
});

