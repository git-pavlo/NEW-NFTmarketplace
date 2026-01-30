import { ethers } from "ethers";
import NFT_ABI from '../abis/NFT.json';
import MARKET_ABI from '../abis/Marketplace.json';

export const NFT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const MARKET_CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
export const categories = ['All', 'Art', 'Gaming', 'Photography', 'Music'];

export async function getNFTContract() {
    if (!window.ethereum) throw new Error('MetaMask not found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI.abi, signer);
}

export async function getMarketContract() {
    if (!window.ethereum) throw new Error('MetaMask not found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(MARKET_CONTRACT_ADDRESS, MARKET_ABI.abi, signer);
}

export async function getAllNFTs() {
    const nft = await getNFTContract();
    const total = Number(await nft.tokenCount());
    const allNFTs = [];

    for (let i = 1; i <= total; i++) {
        try {
            const tokenId = i;
            const uri = await nft.tokenURI(tokenId);
            const owner = await nft.ownerOf(tokenId); // Fetch the owner
            const meta = await fetch(uri).then(res => res.json());

            allNFTs.push({
                tokenId: tokenId, // Consistent naming
                image: meta.image,
                name: meta.name,
                description: meta.description,
                seller: owner, // Map owner to seller for UI compatibility
                categories: meta.categories || []
            });
        } catch (err) {
            console.error(`Error loading NFT ${i}:`, err);
        }
    }
    return allNFTs;
}

export async function getMarketItems() {
    const market = await getMarketContract();
    const nft = await getNFTContract();
    const itemCount = Number(await market.itemCount());
    const salenft = [];

    for (let i = 1; i <= itemCount; i++) {
        const item = await market.items(i);
        // Only include items that are not sold and not cancelled
        if (!item.sold && !item.cancelled) {
            try {
                const uri = await nft.tokenURI(item.tokenId);
                const meta = await fetch(uri).then(res => res.json());

                salenft.push({
                    itemId: Number(item.itemId),
                    tokenId: Number(item.tokenId),
                    seller: item.seller,
                    price: ethers.formatEther(item.price),
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                    categories: meta.categories || []
                });
            } catch (err) {
                console.error(`Error loading market item ${i}:`, err);
            }
        }
    }
    return salenft; 
}