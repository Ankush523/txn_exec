import { ethers } from "ethers";
import axios from "axios";
import { Dcyfr } from "bytekode-eth-decoder";
import uniswapabi from './abis/abi.json'
import sushiswapabi from './abis/abi2.json'
const provider = new ethers.providers.WebSocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/s5BwByPukIVosEOZEfXU68neTN4WsDOy');

const address = "0x816fe884C2D2137C4F210E6a1d925583fa4A917d";
const providerUrl = "https://polygon-mainnet.g.alchemy.com/v2/s5BwByPukIVosEOZEfXU68neTN4WsDOy";
const polygon_provider = new ethers.providers.JsonRpcProvider(providerUrl);
const polygonscanApiKey = "6MD3XR8ZUEPW5KBCBXHB5R741QGR4HES4B";


// const provider = new ethers.providers.WebSocketProvider('wss://polygon-mumbai.g.alchemy.com/v2/CC-YaEP9wPG0mtb2SlesCoDRUlfhAppE');
// const address = "0x816fe884C2D2137C4F210E6a1d925583fa4A917d";
// const providerUrl = "https://polygon-mumbai.g.alchemy.com/v2/CC-YaEP9wPG0mtb2SlesCoDRUlfhAppE";
// const polygon_provider = new ethers.providers.JsonRpcProvider(providerUrl);
// const polygonscanApiKey = "6MD3XR8ZUEPW5KBCBXHB5R741QGR4HES4B";

var txndata = '';
var value = '';
var txFrom = '';
var txTo = '';

async function getConfirmedTransactionDetails(txHash : any) {
  const tx = await provider.getTransaction(txHash);
  if (tx && tx.blockNumber) {
    if(tx.from == address || tx.to == address){
        console.log("Transaction Data : ",tx.data);
        console.log('------------------------------------------------------------------')
        txndata = tx.data;
        txFrom = tx.from;
        if (tx.to) {
          txTo = tx.to;
          console.log("Txn details : ",tx)
          value = ethers.utils.formatEther(tx.value);
          console.log('------------------------------------------------------------------')
          console.log("Contract address:", tx.to);
          console.log('------------------------------------------------------------------')
          const contractABI = await getContractABI();
          if (contractABI) {
            console.log("Contract ABI:", contractABI);
            console.log('------------------------------------------------------------------')
          } else {
            console.log("Unable to fetch contract ABI.");
            console.log('------------------------------------------------------------------')
          }
        } else {
          console.log("Unable to get contract address from the given transaction hash.");
          console.log('------------------------------------------------------------------')
        }
    }
  }
}

provider.on('block', async (blockNumber) => {
  const block = await provider.getBlock(blockNumber);
  if (block && block.transactions) {
    for (const tx of block.transactions) {
      await getConfirmedTransactionDetails(tx);
    }
  }
});

async function getContractABI(): Promise<any> {
    try {
        if((txTo).toLowerCase() === ('0x0dc8e47a1196bcb590485ee8bf832c5c68a52f4b').toLowerCase()){
            const dcyfr = new Dcyfr(sushiswapabi);
            const data = txndata;
            const decodedResponse = dcyfr.getTxInfoFromData({ data })
            const func = decodedResponse?.func
            return func
        }
        else if((txTo).toLowerCase() === ('0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5').toLowerCase()){
            const dcyfr = new Dcyfr(uniswapabi);
            const data = txndata;
            const decodedResponse = dcyfr.getTxInfoFromData({ data })
            const func = decodedResponse?.func
            return func
        }
    } catch (error) {
      console.error("Error while fetching contract ABI:", error);
    }
    return null;
  }