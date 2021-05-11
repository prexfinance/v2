require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "bsc",
  solidity: {
    compilers: [
      {
        version: "0.6.12"
      },
    ]
  },
  networks: {
    bsc: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: [process.env.ACCOUNT_1, process.env.ACCOUNT_2]
    }
  }
};

