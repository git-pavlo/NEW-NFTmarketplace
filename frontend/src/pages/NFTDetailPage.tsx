import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Share2, MoreHorizontal, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockNFTs, type NFT } from '../lib/mockData';
import { toast } from 'sonner@2.0.3';

interface NFTDetailPageProps {
  nftId: string;
  onNavigate: (page: string) => void;
}

export default function NFTDetailPage({ nftId, onNavigate }: NFTDetailPageProps) {
  const [nft, setNft] = useState<NFT | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'history' | 'details'>('properties');

  useEffect(() => {
    const foundNft = mockNFTs.find((n) => n.id === nftId);
    setNft(foundNft || mockNFTs[0]);
  }, [nftId]);

  if (!nft) return null;

  const handleBuy = () => {
    toast.success('Purchase Initiated!', {
      description: 'Please confirm the transaction in your wallet',
      duration: 3000
    });
  };

  const handleBid = () => {
    toast.success('Bid Placed!', {
      description: 'Your bid has been submitted successfully',
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => onNavigate('marketplace')}
          className="mb-8 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Marketplace
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: NFT Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glassmorphism rounded-3xl p-4 sticky top-24">
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 rounded-2xl glassmorphism hover:border-[rgba(138,106,255,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  <span>{nft.likes}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 rounded-2xl glassmorphism hover:border-[rgba(138,106,255,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-3 px-4 rounded-2xl glassmorphism hover:border-[rgba(138,106,255,0.5)] transition-all"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right: NFT Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title and Category */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-sm">
                  {nft.category}
                </span>
                <span
                  className={`px-4 py-1 rounded-full text-sm ${
                    nft.status === 'auction' ? 'bg-[#8a6aff]/20' : 'bg-[#38bdf8]/20'
                  }`}
                >
                  {nft.status === 'auction' ? 'Live Auction' : 'Fixed Price'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl neon-text mb-4">{nft.name}</h1>
            </div>

            {/* Creator and Owner */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glassmorphism rounded-2xl p-4">
                <p className="text-sm text-gray-400 mb-2">Creator</p>
                <p className="neon-text">{nft.creator}</p>
              </div>
              <div className="glassmorphism rounded-2xl p-4">
                <p className="text-sm text-gray-400 mb-2">Owner</p>
                <p className="neon-text">{nft.owner}</p>
              </div>
            </div>

            {/* Price */}
            <div className="glassmorphism rounded-3xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    {nft.status === 'auction' ? 'Current Bid' : 'Price'}
                  </p>
                  <p className="text-4xl neon-text">{nft.price} ETH</p>
                  <p className="text-gray-400 mt-1">≈ ${(nft.price * 2400).toFixed(2)} USD</p>
                </div>
                {nft.status === 'auction' && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">Auction ends in</p>
                    <div className="flex items-center gap-2 text-[#8a6aff]">
                      <Clock className="w-5 h-5" />
                      <span className="text-xl">23:45:12</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Buy/Bid Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nft.status === 'auction' ? handleBid : handleBuy}
                  className="button-glow flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white"
                >
                  {nft.status === 'auction' ? 'Place Bid' : 'Buy Now'}
                </motion.button>
                {nft.status === 'auction' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 rounded-2xl glassmorphism hover:border-[rgba(138,106,255,0.5)] transition-all"
                  >
                    View Bids
                  </motion.button>
                )}
              </div>
            </div>

            {/* Price History Chart */}
            <div className="glassmorphism rounded-3xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#38bdf8]" />
                <h3 className="text-xl">Price History</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={nft.priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 106, 255, 0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 17, 30, 0.95)',
                      border: '1px solid rgba(138, 106, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#e8e9f3'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8a6aff"
                    strokeWidth={3}
                    dot={{ fill: '#8a6aff', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabs */}
            <div className="glassmorphism rounded-3xl overflow-hidden">
              <div className="flex border-b border-[rgba(138,106,255,0.2)]">
                {['properties', 'details', 'history'].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ backgroundColor: 'rgba(138, 106, 255, 0.1)' }}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-4 capitalize transition-colors ${
                      activeTab === tab ? 'text-[#8a6aff] border-b-2 border-[#8a6aff]' : 'text-gray-400'
                    }`}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'properties' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {nft.properties.map((prop, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="glassmorphism rounded-2xl p-4"
                      >
                        <p className="text-sm text-gray-400 mb-1">{prop.trait}</p>
                        <p className="neon-text">{prop.value}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'details' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-gray-300">{nft.description}</p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <p className="text-sm text-gray-400">Blockchain</p>
                        <p className="neon-text">{nft.blockchain}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Royalties</p>
                        <p className="neon-text">{nft.royalties}%</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {[
                      { action: 'Listed', price: nft.price, from: nft.owner, date: '2 hours ago' },
                      { action: 'Minted', price: 0, from: nft.creator, date: '1 day ago' }
                    ].map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glassmorphism rounded-2xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="neon-text">{event.action}</p>
                          <p className="text-sm text-gray-400">{event.from}</p>
                        </div>
                        <div className="text-right">
                          {event.price > 0 && <p className="neon-text">{event.price} ETH</p>}
                          <p className="text-sm text-gray-400">{event.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
