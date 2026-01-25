import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getNFTContract, getMarketContract } from '@/utils/contract';
import { categories } from '@/lib/mockData';

export function useUserNFTs(userAddress) {
  const [collectedNFTs, setCollected] = useState([]);
  const [createdNFTs, setCreated] = useState([]);
  const [onSaleNFTs, setOnSale] = useState([]);

  useEffect(() => {
    if (!userAddress) return;

    async function loadNFTs() {
      const nft = await getNFTContract();
      const market = await getMarketContract();

      const total = await nft.tokenCount();

      const collected = [];
      const created = [];
      const onSale = [];

      for (let tokenId = 1; tokenId <= total; tokenId++) {
        try {
          const owner = await nft.ownerOf(tokenId);
          const uri = await nft.tokenURI(tokenId);

          const meta = await fetch(uri).then(r => r.json());

          const nftData = {
            id: tokenId,
            image: meta.image,
            name: meta.name,
            description: meta.description,
            categories: meta.categories
          };

          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            collected.push(nftData);
          }

          const royalty = await nft.royaltyInfo(tokenId, 10000);
          if (royalty[0].toLowerCase() === userAddress.toLowerCase()) {
            created.push(nftData);
          }
        } catch {}
      }

      for (let i = 1; i <= await market.itemCount(); i++) {
        const item = await market.items(i);
        if (
          !item.sold &&
          item.seller.toLowerCase() === userAddress.toLowerCase()
        ) {
          onSale.push({
            id: item.tokenId,
            price: ethers.formatEther(item.price)
          });
        }
      }

      setCollected(collected);
      setCreated(created);
      setOnSale(onSale);
    }

    loadNFTs();
  }, [userAddress]);

  return { collectedNFTs, createdNFTs, onSaleNFTs };
}
