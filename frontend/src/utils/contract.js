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
            const history = await getTokenPriceHistory(i);
            const currentPrice = history.length > 0 ? history[history.length - 1].price : 0;

            allNFTs.push({
                tokenId: tokenId, // Consistent naming
                ...meta,
                // image: meta.image,
                // name: meta.name,
                // description: meta.description,
                // categories: meta.categories || [],
                seller: owner, // Map owner to seller for UI compatibility
                price: currentPrice.toString(),
                priceHistory: history.length > 0 ? history : [{ date: '2024-01-01', price: 0 }] 
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

                // Fetch auction data for this specific item
                const auction = await market.auctions(item.itemId);
                // An item is an active auction if it has an end time and hasn't ended
                const isAuction = Number(auction.endAt) > 0 && !auction.ended;                

                salenft.push({
                    itemId: Number(item.itemId),
                    tokenId: Number(item.tokenId),
                    seller: item.seller,
                    price: ethers.formatEther(item.price),
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                    categories: meta.categories || [],
                    isAuction: isAuction // New property for filtering
                });
            } catch (err) {
                console.error(`Error loading market item ${i}:`, err);
            }
        }
    }
    return salenft; 
}

// ... existing imports ...

export async function getTokenPriceHistory(tokenId) {
    const market = await getMarketContract();
    
    // 1. Define filters for events related to this token
    const listFilter = market.filters.ItemListed(null, null, tokenId);
    const soldFilter = market.filters.ItemSold(null);
    const auctionFilter = market.filters.AuctionEnded(null);

    // 2. Fetch logs (from block 0 to current)
    const [listEvents, soldEvents, auctionEvents] = await Promise.all([
        market.queryFilter(listFilter),
        market.queryFilter(soldFilter),
        market.queryFilter(auctionFilter)
    ]);

    const history = [];

    // 3. Process Listings (Initial asks)
    for (const event of listEvents) {
        const block = await event.getBlock();
        history.push({
            date: new Date(block.timestamp * 1000).toISOString().split('T')[0],
            price: parseFloat(ethers.formatEther(event.args.price)),
            event: 'Listed'
        });
    }

    // 4. Process Sales (Actual trades)
    // We match ItemSold to ItemListed via itemId if needed, 
    // but usually, a chronological list of prices is what's needed for charts.
    for (const event of soldEvents) {
        const item = await market.items(event.args.itemId);
        if (Number(item.tokenId) === Number(tokenId)) {
            const block = await event.getBlock();
            history.push({
                date: new Date(block.timestamp * 1000).toISOString().split('T')[0],
                price: parseFloat(ethers.formatEther(event.args.price)),
                event: 'Sold'
            });
        }
    }

    // Sort by date and return
    return history.sort((a, b) => new Date(a.date) - new Date(b.date));
}