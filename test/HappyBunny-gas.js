const { expect } = require('chai');
const { ethers } = require('hardhat');

const {
  generateRandomHex,
  completePreSaleBuy,
} = require('./utilities');

describe('HappyBunny gas test', function () {
  beforeEach(async function () {
    this.accounts = await ethers.getSigners();
    const [owner] = await ethers.getSigners();
    this.owner = owner;
    this.provider = ethers.provider;

    const IO = await ethers.getContractFactory('I');
    this.hbContract = await IO.deploy('Happy Bunny', 'HB');
    await this.hbContract.deployed();
  });

  describe('preSaleBuy()', function () {
    beforeEach(async function () {
      this.hbContract.togglePreSaleStatus();

      /*
        Addresses:
        {
         "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": 15,
         "0x70997970C51812dc3A010C7d01b50e0d17dc79C8": 1,
         "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC": 2,
         "0x90F79bf6EB2c4f870365E785982E1f101E93b906": 3
       }
       Merkle Root: 0xf13a391f6d2671c1790bb6c75c2d0f112183d1ede45f85b773ea203222a44974
       Merkle Proof:
       {
       "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": ['0x3f68e79174daf15b50e15833babc8eb7743e730bb9606f922c48e95314c3905c', '0x31403139b3e90fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57'],
       "0x70997970C51812dc3A010C7d01b50e0d17dc79C8": ['0xca0c263ef03fe9a684ef0aa61b1e13332d2e9aa088769eb794d5b463a634bebe', '0x31403139b3e90fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57'],
       "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC": ['0x8d1187a2c5d69d9d0f6e6c8baf49c9549b9573585daef9b8634509e0cb8d99ae', '0x03b1d6e746d6f0c003c976be01df72a711c9a8494865ad74e561e551c21b22a1'],
       "0x90F79bf6EB2c4f870365E785982E1f101E93b906": ['0xd0583fe73ce94e513e73539afcb4db4c1ed1834a418c3f0ef2d5cff7c8bb1dee', '0x03b1d6e746d6f0c003c976be01df72a711c9a8494865ad74e561e551c21b22a1']
      }
      */
      this.hbContract.setMerkleRoot(
        '0xf13a391f6d2671c1790bb6c75c2d0f112183d1ede45f85b773ea203222a44974'
      );
    });

    // it("Should mint 15 to whitelisted minter's wallet", async function () {
    //   const txn = await completePreSaleBuy(
    //     this.iOcontract,
    //     this.accounts[0],
    //     [
    //       '0x3f68e79174daf15b50e15833babc8eb7743e730bb9606f922c48e95314c3905c',
    //       '0x31403139b3e90fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57',
    //     ],
    //     15,
    //     15
    //   );
    // });

    // it("Should mint 1 to whitelisted minter's wallet", async function () {
    //   await completePreSaleBuy(
    //     this.iOcontract,
    //     this.accounts[1],
    //     [
    //       '0xca0c263ef03fe9a684ef0aa61b1e13332d2e9aa088769eb794d5b463a634bebe',
    //       '0x31403139b3e90fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57',
    //     ],
    //     1,
    //     1
    //   );
    // });

    // it("Should mint 2 to whitelisted minter's wallet", async function () {
    //   await completePreSaleBuy(
    //     this.iOcontract,
    //     this.accounts[2],
    //     [
    //       '0x8d1187a2c5d69d9d0f6e6c8baf49c9549b9573585daef9b8634509e0cb8d99ae',
    //       '0x03b1d6e746d6f0c003c976be01df72a711c9a8494865ad74e561e551c21b22a1',
    //     ],
    //     2,
    //     2
    //   );
    // });

    // it("Should mint 3 to whitelisted minter's wallet", async function () {
    //   await completePreSaleBuy(
    //     this.iOcontract,
    //     this.accounts[3],
    //     [
    //       '0xd0583fe73ce94e513e73539afcb4db4c1ed1834a418c3f0ef2d5cff7c8bb1dee',
    //       '0x03b1d6e746d6f0c003c976be01df72a711c9a8494865ad74e561e551c21b22a1',
    //     ],
    //     3,
    //     3
    //   );
    // });

    // it("Should mint 15 to whitelisted minter's wallet then safe transfer token id 7", async function () {
    //   const txn = await completePreSaleBuy(
    //     this.iOcontract,
    //     this.accounts[0],
    //     [
    //       '0x3f68e79174daf15b50e15833babc8eb7743e730bb9606f922c48e95314c3905c',
    //       '0x31403139b3e90fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57',
    //     ],
    //     15,
    //     15
    //   );
    //   const transferTxn = await this.iOcontract['safeTransferFrom(address,address,uint256)'](
    //     this.accounts[0].address,
    //     this.accounts[10].address,
    //     7
    //   );
    // });

    // it("Should mint 3 to whitelisted minter's wallet then safe transfer token id 2", async function () {
    //   const txn = await completePreSaleBuy(
    //     this.iOcontract,
    //     this.accounts[0],
    //     [
    //       '0x3f68e79174daf15b50e15833babc8eb7743e730bb9606f922c48e95314c3905c',
    //       '0x31403139b3e90fd160d993560f6de598174a3c5cbb1dd8614454219f590c1d57',
    //     ],
    //     15,
    //     3
    //   );
    //   const transferTxn = await this.iOcontract['safeTransferFrom(address,address,uint256)'](
    //     this.accounts[0].address,
    //     this.accounts[10].address,
    //     2
    //   );
    // });
  });
});
