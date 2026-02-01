import { motion } from 'motion/react';
import { Heart, Eye } from 'lucide-react';
import { useState, useEffect } from 'react'; 
import { getNFTContract, getMarketContract } from '@/utils/contract';
import { ethers } from 'ethers';

export default function NFTCard({ nft, onClick }) {
  const [NFTstatus, setNFTStatus] = useState('');
  const [loading, setLoading] = useState(true); 
  const [userAddress, setUserAddress] = useState(null); 

  const nftId = nft.tokenId;

  console.log(nft.price)
  useEffect(() => {
    const loadNFTData = async () => {
      try {
        setLoading(true);
              
        const nftContract = await getNFTContract();
        const marketplace = await getMarketContract();
        // Get current user address
        const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);

        // 1. Fetch metadata and owner
        const uri = await nftContract.tokenURI(nftId);
        const owner = await nftContract.ownerOf(nftId);
        const meta = await fetch(uri).then(res => res.json());

        // 2. Scan marketplace for active listing
        const itemCount = Number(await marketplace.itemCount());
        let foundMarketItem = null;
        let activeAuction = null;
        
        for (let i = 1; i <= itemCount; i++) {
          const item = await marketplace.items(i);
          if (Number(item.tokenId) === Number(nftId) && !item.sold && !item.cancelled) {
            foundMarketItem = { 
              itemId: Number(item.itemId), 
              price: ethers.formatEther(item.price), 
              seller: item.seller 
            };
            
            // Check if there is an active auction for this item
            const auction = await marketplace.auctions(item.itemId);
            if (Number(auction.endAt) > 0) {
              activeAuction = {
                highestBid: ethers.formatEther(auction.highestBid),
                endAt: Number(auction.endAt) * 1000,
                highestBidder: auction.highestBidder,
                ended: auction.ended
              };
            }
            break;
          }
        }

        // 3. Determine and Set NFT Status logic
        if (activeAuction && !activeAuction.ended) {
          setNFTStatus('auction');
        } else if (foundMarketItem) {
          setNFTStatus(foundMarketItem.seller.toLowerCase() === address.toLowerCase() ? 'on-sale' : 'buynow');
        } else if (owner.toLowerCase() === address.toLowerCase()) {
          setNFTStatus('collected');
        } else {
          setNFTStatus('view-only');
        }

      } catch (err) {
        console.error("Error loading NFT:", err);
      } finally {
        setLoading(false);
      }
    };
    loadNFTData();
  }, [nftId]);

  console.log(nft)
  console.log(NFTstatus)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="card-hover glassmorphism rounded-3xl overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover"
        />

        {/* Overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="button-glow px-6 py-2 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white"
          >
            <Eye className="w-4 h-4 inline mr-2" />
            View Details
          </motion.button>
        </motion.div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs backdrop-blur-xl ${
              NFTstatus === 'auction'
                ? 'bg-[#8a6aff]/80 text-white'
                : 'bg-[#38bdf8]/80 text-white'
            }`}
          >
            {NFTstatus == 'auction' && 'Auction'}
            {NFTstatus == 'buynow' && 'Buy now'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Category */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="truncate group-hover:text-[#8a6aff] transition-colors">
              {nft.name} #{nft.tokenId}
            </h3>
            <p className="text-sm text-gray-400">{nft.categories}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 hover:text-[#8a6aff] transition-colors"
          >
            <Heart className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Price and Owner */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(138,106,255,0.2)]">
          <div>
            <p className="text-xs text-gray-400">Price</p>
            <p className="neon-text">{nft.price||0} ETH</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Owner</p>
            <p className="text-sm text-gray-300">{nft.owner}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
