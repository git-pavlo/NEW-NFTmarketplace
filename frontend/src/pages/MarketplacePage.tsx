import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { mockNFTs, categories } from '../lib/mockData';
import NFTCard from '../components/NFTCard';

interface MarketplacePageProps {
  onNavigate: (page: string, nftId?: string) => void;
}

export default function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'buy-now' | 'auction'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const filteredNFTs = mockNFTs.filter((nft) => {
    const matchesCategory = selectedCategory === 'All' || nft.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || nft.status === selectedStatus;
    const matchesPrice = nft.price >= priceRange[0] && nft.price <= priceRange[1];
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nft.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesPrice && matchesSearch;
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
            Explore <span className="neon-text">Marketplace</span>
          </h1>
          <p className="text-gray-400">Discover unique digital assets from creators worldwide</p>
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
              className="w-full pl-12 pr-4 py-3 rounded-2xl glassmorphism focus-glow transition-all"
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
              transition={{ delay: 0.2 }}
              className="w-full lg:w-72 flex-shrink-0"
            >
              <div className="glassmorphism rounded-3xl p-6 sticky top-24">
                <h3 className="text-xl mb-6">Filters</h3>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="text-sm text-gray-400 mb-3">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <motion.button
                        key={category}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl transition-all ${
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

                {/* Status Filter */}
                <div className="mb-6">
                  <h4 className="text-sm text-gray-400 mb-3">Status</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Items' },
                      { value: 'buy-now', label: 'Buy Now' },
                      { value: 'auction', label: 'On Auction' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedStatus(option.value as any)}
                        className={`w-full px-4 py-2 rounded-xl text-left transition-all ${
                          selectedStatus === option.value
                            ? 'bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white'
                            : 'glassmorphism hover:border-[rgba(138,106,255,0.5)]'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm text-gray-400 mb-3">Price Range (ETH)</h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                      className="w-full"
                      style={{
                        accentColor: '#8a6aff'
                      }}
                    />
                    <div className="flex justify-between text-sm">
                      <span>{priceRange[0]} ETH</span>
                      <span>{priceRange[1]} ETH</span>
                    </div>
                  </div>
                </div>

                {/* Reset Filters */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedStatus('all');
                    setPriceRange([0, 10]);
                    setSearchQuery('');
                  }}
                  className="w-full py-2 rounded-xl glassmorphism hover:border-[rgba(138,106,255,0.5)] transition-all"
                >
                  Reset Filters
                </motion.button>
              </div>
            </motion.aside>
          )}

          {/* NFT Grid */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4 text-gray-400"
            >
              {filteredNFTs.length} items found
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNFTs.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NFTCard nft={nft} onClick={() => onNavigate('detail', nft.id)} />
                </motion.div>
              ))}
            </div>

            {filteredNFTs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl mb-2">No NFTs Found</h3>
                <p className="text-gray-400">Try adjusting your filters or search query</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
