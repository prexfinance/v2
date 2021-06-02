// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  accounts = await ethers.getSigners();
  admin = accounts[0];
  operator = accounts[1];
  adminAddress = await admin.getAddress();
  operatorAddress = await operator.getAddress();
  // const MockBep20 = await ethers.getContractFactory('MockBEP20');
  // const mockBep20 = await MockBep20.deploy();
  // await mockBep20.deployed();
  // console.log("MockBep20 deployed to:", mockBep20.address);

  // We get the contract to deploy
  const Prediction = await ethers.getContractFactory('BNBPricePrediction');
  const prediction = await Prediction.deploy(
    "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE", //_oracle BNB / USD, 8 DEC, mainnet: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE, testnet: 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526
    adminAddress,                                 //_adminAddress
    operatorAddress,                              //_operatorAddress
    "100",                                        //_intervalBlocks
    "20",                                         //_bufferBlocks
    "100000000000000",                           //_minBetAmount
    "300",                                        //_oracleUpdateAllowance
    "0xe9e7cea3dedca5984780bafc599bd69add087d56", //_BUSD, 0xe9e7cea3dedca5984780bafc599bd69add087d56
  );
  await prediction.deployed();

  console.log("Prediction deployed to:", prediction.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
