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
            console.log(meta);
            const history = await getTokenPriceHistory(i);
            console.log(history);
            const currentPrice = history.length > 0 ? history[history.length - 1].price : 0;

            allNFTs.push({
                tokenId: tokenId, // Consistent naming
                ...meta,
                // image: meta.image,
                // name: meta.name,
                // description: meta.description,
                // categories: meta.categories || [],
                seller: owner, // Map owner to seller for UI compatibility
                // price: ethers.formatEther(item.price),
                peice: currentPrice,
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
export async function getTokenPriceHistory(tokenId) {
  const marketplace = await getMarketContract();

  // const listedEvents = await marketplace.queryFilter(
  //   marketplace.filters.ItemListed(null, tokenId)
  // );

  const soldEvents = await marketplace.queryFilter(
    marketplace.filters.ItemSold(null, tokenId)
  );

  // const auctionStartedEvents = await marketplace.queryFilter(
  //   marketplace.filters.AuctionStarted(null, tokenId)
  // );

  const auctionEndedEvents = await marketplace.queryFilter(
    marketplace.filters.AuctionEnded(null, tokenId)
  );

  let history = [];

  // Fixed-price listing
//   listedEvents.forEach(e => {
//     history.push({
//       type: 'LISTED',
//       price: Number(ethers.formatEther(e.args.price)),
//       timestamp: Number(e.args.timestamp),
//     });
//   });

  // Fixed-price sale
  soldEvents.forEach(e => {
    history.push({
      type: 'SOLD',
      price: Number(ethers.formatEther(e.args.price)),
      timestamp: Number(e.args.timestamp),
    });
  });

  // Auction start (starting bid)
//   auctionStartedEvents.forEach(e => {
//     history.push({
//       type: 'AUCTION_START',
//       price: Number(ethers.formatEther(e.args.startPrice)),
//       timestamp: Number(e.args.timestamp),
//     });
//   });

  // Auction end (winning bid)
  auctionEndedEvents.forEach(e => {
    history.push({
      type: 'AUCTION_END',
      price: Number(ethers.formatEther(e.args.finalPrice)),
      timestamp: Number(e.args.timestamp),
    });
  });

  // 🔥 Sort chronologically
  history.sort((a, b) => a.timestamp - b.timestamp);

  // Format for Recharts
  return history.map(h => ({
    date: new Date(h.timestamp * 1000)
      .toISOString()
      .split('T')[0],
    price: h.price,
    label: h.type
  }));
}
