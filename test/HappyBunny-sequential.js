const { expect } = require("chai");
const { ethers } = require("hardhat");

const { completePublicSaleBuy, daSignatures } = require("./utilities");

const wlSale1MerkleRoot = "0x3ce2e68bf75839f9ea32556eecdb5d030ca163609baca2406669e390f275f7d6";
const wlSale2MerkleRoot = "0xddece176c2312dab9b5949a9ce05e7731282095200374d0aa249a8f33b1bad10";
const getWLSaleData = (address) => {
  const wlAddresses = [
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      allowedQuantity: 1,
      merkleProof: [
        "0x320723cfc0bfa9b0f7c5b275a01ffa5e0f111f05723ba5df2b2684ab86bebe06",
        "0xf9517e24d5f1f504da5daaa3122e9e4ac7b4200955f2e27810823053adb24344",
        "0x18466845411c6cb2a8f4f219a2efc0ec06c09e3211eb5ec1ac2b6ab98361f40f",
        "0x513ffafef1ccd0cf65d2511a9f54c6a368c6bcb6c7d73ece216112f404a56b1b",
      ],
    },
    {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      allowedQuantity: 1,
      merkleProof: [
        "0x3f68e79174daf15b50e15833babc8eb7743e730bb9606f922c48e95314c3905c",
        "0xf9517e24d5f1f504da5daaa3122e9e4ac7b4200955f2e27810823053adb24344",
        "0x18466845411c6cb2a8f4f219a2efc0ec06c09e3211eb5ec1ac2b6ab98361f40f",
        "0x513ffafef1ccd0cf65d2511a9f54c6a368c6bcb6c7d73ece216112f404a56b1b",
      ],
    },
    {
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      allowedQuantity: 1,
      merkleProof: [
        "0xdddcbbfa3a62165890e21b4c6da8b7f72aba588d1650f59000b0f71eae7672c3",
        "0x50eaa1c4e040e69eeb6f95b3f8898b4e9c226fa391c3b19060cc2259f7fe7c75",
        "0x18466845411c6cb2a8f4f219a2efc0ec06c09e3211eb5ec1ac2b6ab98361f40f",
        "0x513ffafef1ccd0cf65d2511a9f54c6a368c6bcb6c7d73ece216112f404a56b1b",
      ],
    },
    {
      address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      allowedQuantity: 1,
      merkleProof: [
        "0xb783e75c6c50486379cdb997f72be5bb2b6faae5b2251999cae874bc1b040af7",
        "0x50eaa1c4e040e69eeb6f95b3f8898b4e9c226fa391c3b19060cc2259f7fe7c75",
        "0x18466845411c6cb2a8f4f219a2efc0ec06c09e3211eb5ec1ac2b6ab98361f40f",
        "0x513ffafef1ccd0cf65d2511a9f54c6a368c6bcb6c7d73ece216112f404a56b1b",
      ],
    },
    {
      address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
      allowedQuantity: 1,
      merkleProof: [
        "0xd4cab63d22f3976e5c6383718052ed60e2992af10435708f4b775f4fc7d97cb3",
        "0xb2e461aaccdebae064f42ec472fe28ceedb0c0d32bc33d2dfd19658c230eec95",
        "0x92b76058d2c2a75d40fcac90b94b16bf14b0fc69830bc236a44432a8ccc28a37",
        "0x513ffafef1ccd0cf65d2511a9f54c6a368c6bcb6c7d73ece216112f404a56b1b",
      ],
    },
    {
      address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
      allowedQuantity: 1,
      merkleProof: [
        "0xc5e3ed14fa1bfe9b4c73e8fa64a2871d0df078699ddd9ebd4c1803c77febfe62",
        "0xb2e461aaccdebae064f42ec472fe28ceedb0c0d32bc33d2dfd19658c230eec95",
        "0x92b76058d2c2a75d40fcac90b94b16bf14b0fc69830bc236a44432a8ccc28a37",
        "0x513ffafef1ccd0cf65d2511a9f54c6a368c6bcb6c7d73ece216112f404a56b1b",
      ],
    },
    {
      address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
      allowedQuantity: 1,
      merkleProof: [
        "0xaf4f2d23c745e6176150c42ca6dbb517770497e5d1ac37a8c046a5f9d943a13b",
        "0xf7d598c4f2e7a3982f0419290937f5e79c73796826f73153097f42aa5b7a008e",
        "0x92b76058d2c2a75d40fcac90b94b16bf14b0fc69830bc236a44432a8ccc28a37",
        "0x513ffafef1ccd0cf65d2511a9f54c6a368c6bcb6c7d73ece216112f404a56b1b",
      ],
    },
    {
      address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
      allowedQuantity: 1,
      merkleProof: [
        "0x54c872e8d7ad731876b4396e6694fa865375b3d72cfdeec0afaf870f0740ffd4",
        "0xf7d598c4f2e7a3982f0419290937f5e79c73796826f73153097f42aa5b7a008e",
        "0x92b76058d2c2a75d40fcac90b94b16bf14b0fc69830bc236a44432a8ccc28a37",
        "0x513ffafef1ccd0cf65d2511a9f54c6a368c6bcb6c7d73ece216112f404a56b1b",
      ],
    },
    {
      address: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
      allowedQuantity: 1,
      merkleProof: [
        "0x56ad87d3a1bceb0330cce4c7a7bc382ddafb41777c581e8276573e02d6805f1e",
        "0x4d2d86b3f3e6ce775b3351a1c84755bd2370f8ca5aa566bef0c439cd9b380a0f",
      ],
    },
    {
      address: "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
      allowedQuantity: 1,
      merkleProof: [
        "0xc389d2176cef6d8cb0726e790f3a2006e76b0ab2ed82ff61c7a80a510992f104",
        "0x4d2d86b3f3e6ce775b3351a1c84755bd2370f8ca5aa566bef0c439cd9b380a0f",
      ],
    },
    {
      address: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
      allowedQuantity: 1,
      merkleProof: [
        "0x07ea28d073297a301aee81c25d1937af3beded6a7b5b743d7d8b0a9a1030d45f",
        "0x8cadcd45059b66e420d73ad057a995e64a7fe501c021a2237fc3831ab82a0a5e",
        "0xc001c5c1f2181a89dfc045fc29a2eafc739338c16ba69c1ffde17cb70c1085ab",
        "0xfc9f2393965711661bc5c7cd01a53b6cff0edda3345b1b9798c830d6d031b721",
      ],
    },
    {
      address: "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
      allowedQuantity: 1,
      merkleProof: [
        "0xdaf6adaf1ccc190c9709e9d24df0fa1627c78d016f90de56b7ac6071ac8965ae",
        "0x8cadcd45059b66e420d73ad057a995e64a7fe501c021a2237fc3831ab82a0a5e",
        "0xc001c5c1f2181a89dfc045fc29a2eafc739338c16ba69c1ffde17cb70c1085ab",
        "0xfc9f2393965711661bc5c7cd01a53b6cff0edda3345b1b9798c830d6d031b721",
      ],
    },
    {
      address: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
      allowedQuantity: 1,
      merkleProof: [
        "0xbfb13fa1bd4d940b09f6dd78fa9291c6ab39356b4106b75fe7579f0018fd54e4",
        "0x8e4caaaeb619113c243cd768c24b3302a8e53827e52c000e0bad8e8a7b71a76f",
        "0xc001c5c1f2181a89dfc045fc29a2eafc739338c16ba69c1ffde17cb70c1085ab",
        "0xfc9f2393965711661bc5c7cd01a53b6cff0edda3345b1b9798c830d6d031b721",
      ],
    },
    {
      address: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      allowedQuantity: 1,
      merkleProof: [
        "0x887bf2b6ffc971474a02e9b8c0fe063c83e7768b24c30117810a839e1421d50d",
        "0x8e4caaaeb619113c243cd768c24b3302a8e53827e52c000e0bad8e8a7b71a76f",
        "0xc001c5c1f2181a89dfc045fc29a2eafc739338c16ba69c1ffde17cb70c1085ab",
        "0xfc9f2393965711661bc5c7cd01a53b6cff0edda3345b1b9798c830d6d031b721",
      ],
    },
    {
      address: "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
      allowedQuantity: 1,
      merkleProof: [
        "0x866efc29ed92681c0f31e90323da3988b035150939bb553a12dff78a572698ea",
        "0xe1f11269d13a746a26313d2f5bac32f208488149fc007f678e6fffa82b7c3610",
        "0x7655adae466facd1dbb133b5954d5add9ac5ee141eab0738b741c4656abbccdb",
        "0xfc9f2393965711661bc5c7cd01a53b6cff0edda3345b1b9798c830d6d031b721",
      ],
    },
    {
      address: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
      allowedQuantity: 1,
      merkleProof: [
        "0xc7f4d5a9017991d662bef6af2816f7a80667fb5890074439b69d135a1f19e215",
        "0xe1f11269d13a746a26313d2f5bac32f208488149fc007f678e6fffa82b7c3610",
        "0x7655adae466facd1dbb133b5954d5add9ac5ee141eab0738b741c4656abbccdb",
        "0xfc9f2393965711661bc5c7cd01a53b6cff0edda3345b1b9798c830d6d031b721",
      ],
    },
    {
      address: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
      allowedQuantity: 1,
      merkleProof: [
        "0x807da9dd69871369f19fde4729682a73941ea2484200d418354ce0b7a9bd27c4",
        "0x5d398391f52eaf7574980e13112768b2bd3174ae67c180e4dd2baa08c3802e7d",
        "0x7655adae466facd1dbb133b5954d5add9ac5ee141eab0738b741c4656abbccdb",
        "0xfc9f2393965711661bc5c7cd01a53b6cff0edda3345b1b9798c830d6d031b721",
      ],
    },
    {
      address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
      allowedQuantity: 1,
      merkleProof: [
        "0x138bc4d22bc451c6cd37e7596aced29fa43c259b6f6aa254d9a34831136630ff",
        "0x5d398391f52eaf7574980e13112768b2bd3174ae67c180e4dd2baa08c3802e7d",
        "0x7655adae466facd1dbb133b5954d5add9ac5ee141eab0738b741c4656abbccdb",
        "0xfc9f2393965711661bc5c7cd01a53b6cff0edda3345b1b9798c830d6d031b721",
      ],
    },
    {
      address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      allowedQuantity: 1,
      merkleProof: ["0xadd45b36ddfaece799172e42d1c5512dedbf5e3406df2b35716427e753d42ee6"],
    },
  ];

  return wlAddresses.find((wlAddress) => wlAddress.address === address);
};

describe("HappyBunny", function () {
  let hbContract;
  let accounts, contractOwner, provider;
  let mintPrice;

  const completePreSaleBuyForUsers = async (users = []) => {
    const mintQty = 1;

    for (const index of users) {
      const user = getWLSaleData(accounts[index].address);
      await hbContract
        .connect(accounts[index])
        .preSaleBuy(user.merkleProof, user.allowedQuantity, mintQty, {
          value: String(mintPrice * mintQty),
        });
      const balance = await hbContract.balanceOf(accounts[index].address);
      expect(parseInt(balance.toString())).to.equal(mintQty);
    }
  };

  // Deploy mint contract
  describe("Deployment", function () {
    it("Should deploy contract", async function () {
      accounts = await ethers.getSigners();
      const [owner] = await ethers.getSigners();
      contractOwner = owner;
      provider = ethers.provider;

      const HappyBunny = await ethers.getContractFactory("HappyBunny");
      hbContract = await HappyBunny.deploy("Happy Bunny", "HB");
      await hbContract.deployed();

      mintPrice = await hbContract.mintPrice();
    });
  });

  describe("Set Base URI", function () {
    // At this point of time, the IPFS will only contain metadata for token id 1
    it("Should allow setting of URI", async function () {
      const newBaseURI = "https://io.mypinata.cloud/ipfs/ipfs-hash/";
      hbContract.setBaseURI(newBaseURI);
      let tokenBaseURIAfter = await hbContract.baseURI();
      expect(tokenBaseURIAfter).to.equal(newBaseURI);
    });
  });

  // Mint for auction
  describe("Auction Mint", function () {
    it("Should allow minting for auction", async function () {
      await hbContract.auctionMint();
      const balance = await hbContract.balanceOf(contractOwner.address);
      expect(parseInt(balance.toString())).to.equal(1);
    });

    it("Should disallow minting for auction if auction supply has been minted", async function () {
      await expect(hbContract.auctionMint()).to.be.revertedWith("ExceedsAllocationForAuction()");
    });
  });

  // Whitelist Sale 1
  describe("Whitelist Sale 1", function () {
    before(async function () {
      // Set merkle root for WL Sale 1
      await hbContract.setMerkleRoot(wlSale1MerkleRoot);
    });

    it("Should not allow minting if whitelist sale 1 has not started", async function () {
      const user1 = getWLSaleData(accounts[1].address);
      await expect(
        hbContract.connect(accounts[1]).preSaleBuy(user1.merkleProof, user1.allowedQuantity, 1, {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("PreSaleInactive()");
    });

    it("Should allow starting of whitelist sale", async function () {
      expect(await hbContract.isPreSaleLive()).to.be.false;
      // Toggle pre-sale to start
      await hbContract.togglePreSaleStatus();
      expect(await hbContract.isPreSaleLive()).to.be.true;
    });

    it("Should not allow minting of public sale", async function () {
      await expect(
        hbContract.connect(accounts[1]).publicSaleBuy(daSignatures[1], {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("PublicSaleInactive()");
    });

    // Minting from contract should fail as merkle proof probably can't be provided - Handle with merkle proof check
    it("Should not allow minting if merkle proof is invalid", async function () {
      const mintQty = 1;
      const user1 = getWLSaleData(accounts[1].address);
      await expect(
        hbContract
          .connect(accounts[1])
          .preSaleBuy(
            [
              "0xca0c263ef03ee9a684ef0aa61b1e13332d2e9aa088769eb794d5b463a634bebe",
              "0x31403139b3e99fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57",
            ],
            user1.allowedQuantity,
            1,
            {
              value: String(mintPrice * mintQty),
            }
          )
      ).to.be.revertedWith("NotOnWhitelist()");
    });

    it("Should not allow minting if not enough ETH sent", async function () {
      const user1 = getWLSaleData(accounts[1].address);
      await expect(
        hbContract.connect(accounts[1]).preSaleBuy(user1.merkleProof, user1.allowedQuantity, 1, {
          value: String(mintPrice * 0.2),
        })
      ).to.be.revertedWith("InsufficientETHSent()");
    });

    it("Should allow minting if has allocated WL and quanitity", async function () {
      await completePreSaleBuyForUsers([1, 2, 3, 4, 5, 6, 7]);
      // Auction Mint + 7 Mints
      expect(await hbContract.totalSupply()).to.equal(8);
    });

    it("Should not allow minting if already minted allocated WL amount", async function () {
      const mintQty = 1;
      const user1 = getWLSaleData(accounts[1].address);
      await expect(
        hbContract
          .connect(accounts[1])
          .preSaleBuy(user1.merkleProof, user1.allowedQuantity, mintQty, {
            value: String(mintPrice * 1),
          })
      ).to.be.revertedWith("ExceedsAllocationForMint()");
    });
  });

  // Whitelist Sale 2
  describe("Whitelist Sale 2", function () {
    before(async function () {
      // Set merkle root for WL Sale 2
      await hbContract.setMerkleRoot(wlSale2MerkleRoot);
    });

    it("Should not allow minting with address from whitelist sale 1", async function () {
      const user8 = getWLSaleData(accounts[8].address);
      await expect(
        hbContract.connect(accounts[8]).preSaleBuy(user8.merkleProof, user8.allowedQuantity, 1, {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("NotOnWhitelist()");
    });

    it("Should not allow minting of public sale", async function () {
      await expect(
        hbContract.connect(accounts[10]).publicSaleBuy(daSignatures[10], {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("PublicSaleInactive()");
    });

    // Minting from contract should fail as merkle proof probably can't be provided - Handle with merkle proof check
    it("Should not allow minting if merkle proof is invalid", async function () {
      const mintQty = 1;
      const user11 = getWLSaleData(accounts[11].address);
      await expect(
        hbContract
          .connect(accounts[11])
          .preSaleBuy(
            [
              "0xca0c263ef03ee9a684ef0aa61b1e13332d2e9aa088769eb794d5b463a634bebe",
              "0x31403139b3e99fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57",
            ],
            user11.allowedQuantity,
            1,
            {
              value: String(mintPrice * mintQty),
            }
          )
      ).to.be.revertedWith("NotOnWhitelist()");
    });

    it("Should not allow minting if not enough ETH sent", async function () {
      const user11 = getWLSaleData(accounts[11].address);
      await expect(
        hbContract.connect(accounts[11]).preSaleBuy(user11.merkleProof, user11.allowedQuantity, 1, {
          value: String(mintPrice * 0.2),
        })
      ).to.be.revertedWith("InsufficientETHSent()");
    });

    it("Should allow minting if has allocated WL and quanitity", async function () {
      await completePreSaleBuyForUsers([11, 12, 13, 14]);

      // Auction Mint + 7 Mints + 4 mints
      expect(await hbContract.totalSupply()).to.equal(12);
    });

    it("Should not allow minting if already minted allocated WL amount", async function () {
      const mintQty = 1;
      const user11 = getWLSaleData(accounts[11].address);
      await expect(
        hbContract
          .connect(accounts[11])
          .preSaleBuy(user11.merkleProof, user11.allowedQuantity, mintQty, {
            value: String(mintPrice * 1),
          })
      ).to.be.revertedWith("ExceedsAllocationForMint()");
    });
  });

  describe("Public Sale", function () {
    it("Should not allow minting if public sale has not started", async function () {
      await expect(
        hbContract.connect(accounts[15]).publicSaleBuy(daSignatures[15], {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("PublicSaleInactive()");
    });

    it("Should not allow toggling public sale if whitelist sale is still active", async function () {
      await expect(hbContract.togglePublicSaleStatus()).to.be.revertedWith("PreSaleStillActive()");
    });

    it("Should allow toggling public sale", async function () {
      await hbContract.togglePreSaleStatus();
      expect(await hbContract.isPublicSaleLive()).to.be.false;
      // Toggle public sale to start
      await hbContract.togglePublicSaleStatus();
      expect(await hbContract.isPublicSaleLive()).to.be.true;
    });

    it("Should not allow minting even with whitelist from whitelist sale 2", async function () {
      const user15 = getWLSaleData(accounts[15].address);
      await expect(
        hbContract.connect(accounts[15]).preSaleBuy(user15.merkleProof, user15.allowedQuantity, 1, {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("PreSaleInactive()");
    });

    it("Should not allow minting with address from whitelist sale 1", async function () {
      await expect(
        hbContract.connect(accounts[7]).publicSaleBuy(daSignatures[7], {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("ExceedsAllocationForMint()");
    });

    it("Should not allow minting with address from whitelist sale 2", async function () {
      await expect(
        hbContract.connect(accounts[11]).publicSaleBuy(daSignatures[11], {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("ExceedsAllocationForMint()");
    });

    it("Should not allow minting if signer address is not set", async function () {
      await expect(
        hbContract.connect(accounts[8]).publicSaleBuy(daSignatures[8], {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("DirectMintFromBotNotAllowed()");
    });

    it("Should not allow minting if not enough ETH sent", async function () {
      // Set signer address
      await hbContract.setSignerAddress("0x978D5cc8d783F4c8C0497DAa8F727723243e5B2b");

      // Cannot validate as signerAddress is private - Verify if can mint
    });

    it("Should not allow minting if not enough ETH sent", async function () {
      await expect(
        hbContract.connect(accounts[15]).publicSaleBuy(daSignatures[15], {
          value: String(mintPrice * 0.5),
        })
      ).to.be.revertedWith("InsufficientETHSent()");
    });

    it("Should allow minting", async function () {
      await hbContract.connect(accounts[15]).publicSaleBuy(daSignatures[15], {
        value: String(mintPrice * 1),
      });

      const balance = await hbContract.balanceOf(accounts[15].address);
      expect(parseInt(balance.toString())).to.equal(1);

      // Auction Mint + 7 WL1 Mints + 4 WL2 mints + 1 Public mint
      expect(await hbContract.totalSupply()).to.equal(13);
    });

    it("Should not allow minting with same wallet", async function () {
      await expect(
        hbContract.connect(accounts[15]).publicSaleBuy(daSignatures[15], {
          value: String(mintPrice * 1),
        })
      ).to.be.revertedWith("ExceedsAllocationForMint()");
    });

    it("Should allow minting if not minted in whitelist sale 1", async function () {
      await hbContract.connect(accounts[8]).publicSaleBuy(daSignatures[8], {
        value: String(mintPrice * 1),
      });

      const balance = await hbContract.balanceOf(accounts[8].address);
      expect(parseInt(balance.toString())).to.equal(1);

      // Auction Mint + 7 WL1 Mints + 4 WL2 mints + 2 Public mint
      expect(await hbContract.totalSupply()).to.equal(14);
    });

    it("Should allow minting if not minted in whitelist sale 2", async function () {
      await hbContract.connect(accounts[19]).publicSaleBuy(daSignatures[19], {
        value: String(mintPrice * 1),
      });

      const balance = await hbContract.balanceOf(accounts[19].address);
      expect(parseInt(balance.toString())).to.equal(1);

      // Auction Mint + 7 WL1 Mints + 4 WL2 mints + 3 Public mint
      expect(await hbContract.totalSupply()).to.equal(15);
    });
  });

  // End of Public Sale
  describe("End of Public Sale", function () {
    let totalMintedQuantity;

    describe("Mint Remaining Supply", function () {
      it("Should not allow minting of remaining supply if public sale is live", async function () {
        await expect(hbContract.mintRemainingSupply()).to.be.revertedWith("SalesStillActive()");
      });

      it("Should allow minting of remaining supply", async function () {
        // Toggle public sale to stop
        await hbContract.togglePublicSaleStatus();

        totalMintedQuantity = await hbContract.totalSupply();

        await hbContract.mintRemainingSupply();

        expect(await hbContract.totalSupply()).to.equal(await hbContract.MAX_SUPPLY());
      });

      it("Should not allow minting of remaining supply if exceeding max supply", async function () {
        await expect(hbContract.mintRemainingSupply()).to.be.revertedWith("CollectionMintedOut()");
      });
    });

    describe("Burn Remaining Supply", function () {
      it("Should allow burning of remaining supply", async function () {
        await hbContract.burnRemainingSupply();
        expect(await hbContract.totalSupply()).to.equal(totalMintedQuantity);
      });

      it("Should not allow burning of remaining supply if supply to be burn", async function () {
        await expect(hbContract.burnRemainingSupply()).to.be.revertedWith("NoSupplyToBurn()");
      });
    });

    // On reveal date, only need to update the JSONs for the remaining 1000 tokens as base uri has already been set previously
  });

  describe('withdraw()', function () {
    it('Should allow withdrawing of entire balance to wallet', async function () {
      const contractBalanceBefore = await provider.getBalance(hbContract.address);
      // Balance in contract should have balance for 14 minted (excluding auction minted)
      expect(contractBalanceBefore.toBigInt()).to.equal(
        BigInt(14 * mintPrice)
      );

      const txn = await hbContract.withdraw();
      const contractBalanceAfter = await provider.getBalance(hbContract.address);
      const walletBalance = await provider.getBalance(hbContract.TREASURY_WALLET());
      // Balance in contract should be empty
      expect(contractBalanceAfter.toNumber()).to.equal(0);
      // Balance shuould be in TREASURY_WALLET
      expect(walletBalance.toBigInt()).to.equal(contractBalanceBefore.toBigInt());
    });
  });
});
