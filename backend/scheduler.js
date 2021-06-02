require('dotenv').config();
const { ethers } = require('ethers');
const schedule = require('node-schedule');
const { bscMainnet, bscTestnet, bnbPredictionMainnet, bnbPredictionTestnet } = require('./constants');
const abi = require('./abi.json');

schedule.scheduleJob('*/15 * * * * *', async () => {
  try {
    const bscProvider = new ethers.providers.JsonRpcProvider(bscMainnet);
    const operatorSigner = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY, bscProvider);
    const predContract = new ethers.Contract(bnbPredictionMainnet, abi, operatorSigner);
    const currentEpoch = await predContract.currentEpoch();
    const currentBlock = await bscProvider.getBlockNumber();
    // The block at which the round can be locked
    const currentRound = await predContract.rounds(currentEpoch);
    // How many blocks after the lockBlock/endBlock can executeRound still be called
    const bufferBlocks = await predContract.bufferBlocks();
    const genesisStartOnce = await predContract.genesisStartOnce();
    const genesisLockOnce = await predContract.genesisLockOnce();
    console.log("genesisStartOnce", genesisStartOnce);
    console.log("genesisLockOnce", genesisLockOnce);
    console.log("current epoch:", currentEpoch);
    // console.log("current round:", currentRound);
    console.log("current block", currentBlock);
    if (missedLockBlocks(currentBlock, currentRound, bufferBlocks) && !currentEpoch.eq(ethers.BigNumber.from("0"))) {
      console.log("RESET");
      const adminSigner = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, bscProvider);
      const predContractAdmin = new ethers.Contract(bnbPredictionMainnet, abi, adminSigner);
      let isPaused = await predContractAdmin.paused();
      console.log("IS PAUSED", isPaused);
      if (!isPaused) {
        const pauseTx = await predContractAdmin.pause();
        await pauseTx.wait();
      }
      isPaused = await predContractAdmin.paused();
      console.log("IS PAUSED 2", isPaused);
      const unpauseTx = await predContractAdmin.unpause();
      await unpauseTx.wait();
      isPaused = await predContractAdmin.paused();
      console.log("IS PAUSED 3", isPaused);
    };
    if (!genesisStartOnce) {
      await predContract.genesisStartRound();
      console.log("GENESIS ROUND START");
      return;
    } else if (!genesisLockOnce && viableGenesisRoundExecute(currentBlock, currentRound, bufferBlocks)) {
      await predContract.genesisLockRound();
      console.log("GENESIS ROUND LOCK");
    } else {
      // The block at which the round can end
      const previousRound = await predContract.rounds(currentEpoch.sub(ethers.BigNumber.from("1")));
      // console.log("previous round:", previousRound);
      if (viableRoundExecute(currentBlock, currentRound, previousRound, bufferBlocks)) {
        await predContract.executeRound();
        console.log("EXECUTE ROUND");
      } else {
        console.log("Cannot execute round");
      }
    }
  } catch(e) {
    console.error('Error: ', e);
  }
});

const viableGenesisRoundExecute = (currentBlock, currentRound, bufferBlocks) => {
  const currentLockBlock = currentRound[2];
  console.log("CURRENT LOCK BLOCK:", currentLockBlock);
  const currentBlockBN = ethers.BigNumber.from(currentBlock.toString()); 
  return currentBlockBN.gte(currentLockBlock) && currentBlockBN.lte(currentLockBlock.add(bufferBlocks));
}

const viableRoundExecute = (currentBlock, currentRound, previousRound, bufferBlocks) => {
  const currentLockBlock = currentRound[2];
  const currentEndBlock = previousRound[3];
  console.log("CURRENT LOCK BLOCK:", currentLockBlock);
  console.log("CURRENT END BLOCK:", currentEndBlock);
  const currentBlockBN = ethers.BigNumber.from(currentBlock.toString()); 
  return currentBlockBN.gte(currentLockBlock) && currentBlockBN.lte(currentLockBlock.add(bufferBlocks)) && currentBlockBN.gte(currentEndBlock) && currentBlockBN.lte(currentEndBlock.add(bufferBlocks));
}

const missedLockBlocks = (currentBlock, currentRound, bufferBlocks) => {
  const currentLockBlock = currentRound[2];
  console.log("CURRENT LOCK BLOCK:", currentLockBlock);
  const currentBlockBN = ethers.BigNumber.from(currentBlock.toString()); 
  return currentBlockBN.gt(currentLockBlock.add(bufferBlocks));
}