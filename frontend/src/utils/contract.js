import { ethers } from "ethers";
import NFT_ABI from '../abis/NFT.json';
import MARKET_ABI from '../abis/Marketplace.json';

const NFT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const MARKET_CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

export async function getNFTContract() {
      // Connect MetaMask
    if (!window.ethereum) throw new Error('MetaMask not found');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI.abi, signer);
}

export async function getMarketContract() {
      // Connect MetaMask
    if (!window.ethereum) throw new Error('MetaMask not found');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(MARKET_CONTRACT_ADDRESS, MARKET_ABI.abi, signer);
}

