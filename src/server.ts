import { ethers } from "ethers";
import axios from "axios";
import { Dcyfr } from "bytekode-eth-decoder";
const provider = new ethers.WebSocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/s5BwByPukIVosEOZEfXU68neTN4WsDOy');

const address = "0x816fe884C2D2137C4F210E6a1d925583fa4A917d";
const providerUrl = "https://polygon-mainnet.g.alchemy.com/v2/s5BwByPukIVosEOZEfXU68neTN4WsDOy";
const polygon_provider = new ethers.JsonRpcProvider(providerUrl);
const polygonscanApiKey = "6MD3XR8ZUEPW5KBCBXHB5R741QGR4HES4B";

var txndata = '';

async function getConfirmedTransactionDetails(txHash : any) {
  const tx = await provider.getTransaction(txHash);
  if (tx && tx.blockNumber) {
    if(tx.from == address || tx.to == address)
    {
        console.log("Transaction Data : ",tx.data);
        txndata = tx.data;
        console.log(tx.to)
      getPendingContractAddress(tx.hash).then(async (contractAddress) => {
        if (tx.to) {
          console.log("Contract address:", tx.to);
          console.log("----------------------------------------------------------------")
          const contractABI = await getContractABI(tx.to);
          if (contractABI) {
            console.log("Contract ABI:", contractABI);
          } else {
            console.log("Unable to fetch contract ABI.");
          }
        } else {
          console.log("Unable to get contract address from the given transaction hash.");
        }
      });
    }
  }
}

provider.on('block', async (blockNumber) => {
  const block = await provider.getBlock(blockNumber, true);
  if (block && block.transactions) {
    for (const tx of block.transactions) {
      await getConfirmedTransactionDetails(tx);
    }
  }
});

async function getContractABI(contractAddress: string): Promise<any> {
    try {
      const response = await axios.get(
          `https://api.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${polygonscanApiKey}`
      );
      if (response.data.status === "1") {
        const dcyfr = new Dcyfr(response.data.result);
        const data = txndata;
        const decodedResponse = dcyfr.getTxInfoFromData({ data })
        console.log(decodedResponse)
        const func = decodedResponse?.func
        console.log("Executed Function : ",func)
        console.log('------------------------------------------------------------------')
        return JSON.parse(response.data.result);
      } else {
        console.error("Error while fetching contract ABI:", response.data.message);
      }
    } catch (error) {
      console.error("Error while fetching contract ABI:", error);
    }
    return null;
  }

  async function getPendingContractAddress(transactionHash: string): Promise<string | null> {
    try {
      const transaction = await polygon_provider.getTransaction(transactionHash);
  
      if (transaction) {
        var receipt = await polygon_provider.getTransactionReceipt(transactionHash);
        if (receipt) {
          if (receipt.status === 1) {
            return receipt.contractAddress;
          } else {
            console.log("Transaction failed or is not a contract creation transaction.");
          }
        } else {
          console.log("Transaction is still pending.");
        }
      } else {
        console.log("Transaction hash not found on the blockchain.");
      }
    } catch (error) {
      console.error("Error while fetching transaction data:", error);
    }
    return null;
  }