const CarbonOffsetToken = artifacts.require("CarbonOffsetToken");

module.exports = function(deployer) {
  // Parameters: initialSupply, initialPrice (in wei)
  // 1000 tokens, 0.01 ETH per token
  const initialSupply = 1000;
  const initialPrice = web3.utils.toWei('0.01', 'ether');
  
  deployer.deploy(CarbonOffsetToken, initialSupply, initialPrice);
};