const { ethers, upgrades } = require("hardhat")

// To deploy the proxy contract and implementation contract run the following:
// yarn hardhat run --network sepolia scripts/deploy.js

// To verify the contract, run the following:
// yarn hardhat verify <deployed contract address> <contract name> <contract symbol> [<contract other params>] --network sepolia
async function main() {
  ;[deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  const HB = await ethers.getContractFactory("HB")
  const HBContract = await HB.deploy(
    "HB",
    "HB"
  )
  const deployed = await HBContract.deployed()
  console.log("deployed contract:", deployed.address)
}

main()
