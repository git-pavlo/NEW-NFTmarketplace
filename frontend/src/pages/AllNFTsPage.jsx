import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { getAllNFTs, categories } from '../utils/contract';
import NFTCard from '../components/NFTCard';

export default function AllNFTsPage({ onNavigate }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  // const [selectedStatus, setSelectedStatus] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    async function fetchNFTs() {
      try {
        setLoading(true);
        const data = await getAllNFTs();
        setNfts(data);
      } catch (error) {
        console.error("Error fetching marketplace items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNFTs();
  }, []);

  console.log(nfts)

  const filteredNFTs = nfts.filter((nft) => {
    const nftCategory = nft.categories?.[0] || 'Art';
    const matchesCategory =
      selectedCategory === 'All' || nftCategory === selectedCategory;

    // Status logic: In a live market, items are either 'buy-now' or 'auction' 
    // depending on your contract logic. For now, we mirror your filter.
    // const matchesStatus =
    //   selectedStatus === 'all' || (selectedStatus === 'buy-now');

    // const matchesPrice =
    //   Number(nft.price) >= priceRange[0] && Number(nft.price) <= priceRange[1];

    const matchesSearch =
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nftCategory.toLowerCase().includes(searchQuery.toLowerCase());

    console.log(nft)
    console.log(matchesCategory)
    // console.log(matchesPrice)
    console.log(matchesSearch)
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl mb-4">
            Explore <span className="neon-text">All NFTs</span>
          </h1>
          <p className="text-gray-400">
            Discover real digital assets synced with the blockchain
          </p>
        </motion.div>

        {/* Search and Filter Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search NFTs by name or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl glassmorphism focus-glow transition-all outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="button-glow px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </motion.button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-72 flex-shrink-0"
            >
              <div className="glassmorphism rounded-3xl p-6 sticky top-24">
                <h3 className="text-xl mb-6">Filters</h3>

                <div className="mb-6">
                  <h4 className="text-sm text-gray-400 mb-3">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <motion.button
                        key={category}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white'
                            : 'glassmorphism hover:border-[rgba(138,106,255,0.5)]'
                        }`}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm text-gray-400 mb-3">Status</h4>
                  {/* <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Items' },
                      { value: 'buy-now', label: 'Buy Now' },
                      { value: 'auction', label: 'On Auction' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedStatus(option.value)}
                        className={`w-full px-4 py-2 rounded-xl text-left transition-all ${
                          selectedStatus === option.value
                            ? 'bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white'
                            : 'glassmorphism hover:border-[rgba(138,106,255,0.5)]'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div> */}
                </div>

                {/* Price Range */}
                {/* <div className="mb-6">
                  <h4 className="text-sm text-gray-400 mb-3">Price Range (ETH)</h4>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-[#8a6aff]"
                  />
                  <div className="flex justify-between text-xs mt-2 text-gray-300">
                    <span>{priceRange[0]} ETH</span>
                    <span>{priceRange[1]} ETH</span>
                  </div>
                </div> */}

                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    // setPriceRange([0, 10]);
                    setSearchQuery('');
                  }}
                  className="w-full py-2 rounded-xl glassmorphism hover:bg-white/5 transition-all text-sm"
                >
                  Reset Filters
                </button>
              </div>
            </motion.aside>
          )}

          {/* NFT Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#8a6aff] animate-spin mb-4" />
                <p className="text-gray-400">Fetching assets from the blockchain...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-400">
                  {filteredNFTs.length} items found
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNFTs.map((nft) => (
                    <NFTCard
                      key={nft.tokenId}
                      nft={{
                        ...nft,
                        categories: nft.categories?.[0] || 'Art',
                        // Use fallback if seller is missing
                        owner: nft.seller 
                          ? `${nft.seller.slice(0, 6)}...${nft.seller.slice(-4)}` 
                          : 'Unknown'
                      }}
                      onClick={() => onNavigate('detail', nft.tokenId)}
                    />
                  ))}
                </div>

                {filteredNFTs.length === 0 && (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <div className="text-6xl mb-4">💎</div>
                    <h3 className="text-2xl mb-2">No NFTs listed</h3>
                    <p className="text-gray-400">Be the first to create and list an NFT!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}