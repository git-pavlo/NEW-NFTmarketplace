import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getNFTContract, getMarketContract } from '../utils/contract';

export function useUserNFTs(userAddress) {
  const [collectedNFTs, setCollected] = useState([]);
  const [createdNFTs, setCreated] = useState([]);
  const [onSaleNFTs, setOnSale] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userAddress) return;

    async function loadNFTs() {
      try {
        const nft = await getNFTContract();
        const market = await getMarketContract();
        const total = Number(await nft.tokenCount());

        const collected = [];
        const created = [];
        
        // 1. Load Collected & Created
        for (let tokenId = 1; tokenId <= total; tokenId++) {
          try {
            const owner = await nft.ownerOf(tokenId);
            const uri = await nft.tokenURI(tokenId);
            const meta = await fetch(uri).then(r => r.json());

            const nftData = {
              tokenId: tokenId,
              image: meta.image,
              name: meta.name,
              description: meta.description,
              creator: meta.creator,
              price: ethers.formatEther(meta.price),
              categories: meta.categories || []
            };

            if (owner.toLowerCase() === userAddress.toLowerCase()) {
              collected.push(nftData);
            }

            const royalty = await nft.royaltyInfo(tokenId, 10000);
            if (royalty[0].toLowerCase() === userAddress.toLowerCase()) {
              created.push(nftData);
            }
            console.log(nftData);
          } catch (err) {
            console.error(`Error loading NFT ${tokenId}:`, err);
          }
        }

        // 2. Load On Sale (including metadata and cancellation check)
        const onSale = [];
        const itemCount = Number(await market.itemCount());
        
        for (let i = 1; i <= itemCount; i++) {
          const item = await market.items(i);
          if (
            !item.sold && 
            !item.cancelled && // Added check
            item.seller.toLowerCase() === userAddress.toLowerCase()
          ) {
            const uri = await nft.tokenURI(item.tokenId);
            const meta = await fetch(uri).then(r => r.json());
            
            onSale.push({
              tokenId: Number(item.tokenId),
              itemId: Number(item.itemId),
              price: ethers.formatEther(item.price),
              name: meta.name,
              image: meta.image
            });
          }
        }

        setCollected(collected);
        setCreated(created);
        setOnSale(onSale);
      } catch (error) {
        console.error("Failed to load user NFTs:", error);
      } finally {
        setLoading(false);
      }
    }

    loadNFTs();
  }, [userAddress]);

  return { collectedNFTs, createdNFTs, onSaleNFTs, loading };
}