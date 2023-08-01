const Web3 = require("web3");
const tokenContractConfig = require("./config/contracts/token-contract");

const web3 = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/"));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function allowance(
  tokenAddress,
  walletAddress,
  spenderAddress
) {
  const contract = new web3.eth.Contract(
    tokenContractConfig.abi,
    tokenAddress
  );

  const method = contract.methods["allowance"](walletAddress, spenderAddress);
  const allowanceResult = await method.call();

  return allowanceResult !== "0";
}

async function approve(
  tokenAddress,
  walletPrivateKey,
  spenderAddress
) {
  const holder = web3.eth.accounts.privateKeyToAccount(walletPrivateKey);
  const walletAddress = holder.address;

  const contract = new web3.eth.Contract(
    tokenContractConfig.abi,
    tokenAddress
  );

  const gasPrice = 5 * 1000000000;
  const approveMethod = contract.methods["approve"](
    spenderAddress,
    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  );
  const functionAbi = approveMethod.encodeABI();

  const estimateOptions = {
    from : walletAddress,
    gasPrice
  };
  const testGas = await approveMethod
    .estimateGas(estimateOptions);

  const gasLimit = parseInt(testGas) * 2;

  const txParams = {
    gas : web3.utils.toHex(gasLimit),
    gasPrice : web3.utils.toHex(gasPrice),
    chainId : 56,
    data : functionAbi,
    to : tokenAddress
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    txParams,
    walletPrivateKey
  );

  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  return receipt;
}

async function balanceOf(tokenAddress, holderAddress) {
  const contract = new web3.eth.Contract(
    tokenContractConfig.abi,
    tokenAddress
  );

  const method = contract.methods["balanceOf"](holderAddress);
  const balanceOf = await method.call();

  return balanceOf;
}

module.exports = {
  allowance,
  approve,
  balanceOf
};
