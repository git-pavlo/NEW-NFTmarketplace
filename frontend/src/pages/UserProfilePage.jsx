import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Share2, Settings, ExternalLink } from 'lucide-react';
import { mockNFTs } from '../lib/mockData';
import NFTCard from '../components/NFTCard';
import { toast } from 'sonner@2.0.3';
import { useAccount, useDisconnect } from 'wagmi';
import { useUserNFTs } from './useUserNFTs';


export default function UserProfilePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('collected');
  const [NFTstatus, setNFTStatus] = useState('sale');
  const { isConnected, address } = useAccount();
  const walletAddress = address; // from wallet connect

  const {
    collectedNFTs,
    createdNFTs,
    onSaleNFTs
  } = useUserNFTs(walletAddress);

  const getCurrentNFTs = () => {
    switch (activeTab) {
      case 'collected':
        return collectedNFTs;
      case 'created':
        return createdNFTs;
      case 'on-sale':
        return onSaleNFTs;
      default:
        return [];
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Wallet address copied!', {
      duration: 2000
    });
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          {/* Banner */}
          <div className="h-64 rounded-3xl overflow-hidden mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8a6aff] via-[#38bdf8] to-[#06b6d4]" />
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0 opacity-50"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                backgroundSize: '200% 100%'
              }}
            />
          </div>

          {/* Avatar and Info */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20 relative z-10">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#8a6aff] to-[#38bdf8] p-1"
            >
              <div className="w-full h-full rounded-3xl glassmorphism flex items-center justify-center text-5xl">
                🎨
              </div>
            </motion.div>

            <div className="flex-1">
              <div className="glassmorphism rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl mb-2 neon-text">Anonymous Creator</h1>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-mono">{walletAddress}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={copyAddress}
                        className="hover:text-[#8a6aff] transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 rounded-2xl glassmorphism hover:border-[rgba(138,106,255,0.5)] transition-all flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 rounded-2xl glassmorphism hover:border-[rgba(138,106,255,0.5)] transition-all flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <StatBox label="NFTs Owned" value="247" />
          <StatBox label="Created" value="12" />
          <StatBox label="Total Volume" value="145.8 ETH" />
          <StatBox label="Floor Price" value="2.4 ETH" />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="glassmorphism rounded-3xl p-2 inline-flex gap-2">
            {[
              { id: 'collected', label: 'Collected', count: collectedNFTs.length },
              { id: 'created', label: 'Created', count: createdNFTs.length },
              { id: 'on-sale', label: 'On Sale', count: onSaleNFTs.length }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-2xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white'
                    : 'hover:bg-[rgba(138,106,255,0.1)]'
                }`}
              >
                {tab.label} ({tab.count})
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* NFT Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
        >
          {getCurrentNFTs().map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <NFTCard nft={nft} onClick={() => onNavigate('detail', nft.id, NFTstatus)} />
            </motion.div>
          ))}
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glassmorphism rounded-3xl p-6"
        >
          <h2 className="text-2xl mb-6">
            Recent <span className="neon-text">Activity</span>
          </h2>

          <div className="space-y-3">
            {[
              { action: 'Purchased', nft: 'Cosmic Dream #4521', price: '2.5 ETH', time: '2 hours ago' },
              { action: 'Listed', nft: 'Neon Genesis #1337', price: '3.8 ETH', time: '5 hours ago' },
              { action: 'Sold', nft: 'Ethereal Vision #888', price: '1.9 ETH', time: '1 day ago' },
              { action: 'Minted', nft: 'Digital Landscape #2048', price: '—', time: '2 days ago' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                className="glassmorphism rounded-2xl p-4 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                    activity.action === 'Purchased' ? 'from-[#8a6aff] to-[#a78bfa]' :
                    activity.action === 'Listed' ? 'from-[#38bdf8] to-[#06b6d4]' :
                    activity.action === 'Sold' ? 'from-[#06b6d4] to-[#8a6aff]' :
                    'from-[#a78bfa] to-[#8a6aff]'
                  } flex items-center justify-center`}>
                    {activity.action === 'Purchased' && '🛒'}
                    {activity.action === 'Listed' && '📋'}
                    {activity.action === 'Sold' && '💰'}
                    {activity.action === 'Minted' && '✨'}
                  </div>
                  <div>
                    <p className="neon-text">{activity.action} {activity.nft}</p>
                    <p className="text-sm text-gray-400">{activity.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="neon-text">{activity.price}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// StatBox component
function StatBox({ label, value }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glassmorphism rounded-2xl p-6 text-center"
    >
      <p className="text-3xl mb-2 neon-text">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
}
