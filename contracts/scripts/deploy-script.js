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
  // We get the contract to deploy
  const Prediction = await ethers.getContractFactory('MockBNBPricePrediction');
  const prediction = await Prediction.deploy(
    "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE", //_oracle BNB / USD, 8 DEC
    adminAddress,                                 //_adminAddress
    operatorAddress,                              //_operatorAddress
    "100",                                        //_intervalBlocks
    "20",                                         //_bufferBlocks
    "1000000000000000",                           //_minBetAmount
    "300",                                        //_oracleUpdateAllowance
    "0xe9e7cea3dedca5984780bafc599bd69add087d56", //_BUSD
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
