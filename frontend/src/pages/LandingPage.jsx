import { motion } from 'motion/react';
import { useEffect, useState, useMemo } from 'react';
import { TrendingUp, Users, Layers, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import NFTCard from '../components/NFTCard';
import { getAllNFTs } from '../utils/contract';

export default function LandingPage({ onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true); // Fixed: Added missing loading state
  const [stats, setStats] = useState({
    volume: 0,
    users: 0,
    collections: 0
  });

  useEffect(() => {
    async function fetchNFTs() {
      try {
        setLoading(true);
        const data = await getAllNFTs();
        // Fallback to mock data if contract is empty or not yet deployed
        setNfts(data);
      } catch (error) {
        console.error("Error fetching marketplace items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNFTs();
  }, []);

  // Fixed: Added [nfts] as dependency so it updates when data is fetched
  const featuredNFTs = useMemo(() => nfts.slice(0, 3), [nfts]);

  // Auto-slide carousel
  useEffect(() => {
    if (featuredNFTs.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNFTs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredNFTs.length]);

  // Animated counters
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const targetVolume = 2847;
    const targetUsers = 125000;
    const targetCollections = 8543;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;

      setStats({
        volume: Math.floor(targetVolume * progress),
        users: Math.floor(targetUsers * progress),
        collections: Math.floor(targetCollections * progress)
      });

      if (step >= steps) clearInterval(interval);
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredNFTs.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredNFTs.length) % featuredNFTs.length
    );
  };

  if (loading && nfts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#8a6aff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 mt-10">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(138, 106, 255, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(138, 106, 255, 0.15) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute inset-0"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              className="text-5xl md:text-7xl mb-6 neon-text font-bold"
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Discover, Collect & Trade NFTs
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              The premier marketplace for digital creators and collectors. Join the future of digital ownership.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('marketplace')}
                className="button-glow px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white font-semibold"
              >
                Explore Marketplace
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('create')}
                className="px-8 py-4 rounded-2xl glassmorphism hover:border-[rgba(138,106,255,0.5)] transition-all font-semibold"
              >
                Create NFT
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured NFT Carousel */}
      {featuredNFTs.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl mb-12 text-center font-bold"
            >
              Featured <span className="neon-text">Collections</span>
            </motion.h2>

            <div className="relative">
              <div className="overflow-hidden rounded-3xl">
                <motion.div
                  animate={{ x: `-${currentSlide * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex"
                >
                  {featuredNFTs.map((nft) => (
                    <div key={nft.id} className="w-full flex-shrink-0 px-2">
                      <div className="glassmorphism rounded-3xl overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-8 p-8">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl"
                          >
                            <img
                              src={nft.image}
                              alt={nft.name}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                          <div className="flex flex-col justify-center">
                            <h3 className="text-3xl mb-4 neon-text font-bold">{nft.name}</h3>
                            <p className="text-gray-300 mb-6 line-clamp-3">{nft.description}</p>
                            <div className="flex items-center justify-between mb-8 p-4 rounded-2xl bg-white/5">
                              <div>
                                <p className="text-sm text-gray-400">Current Price</p>
                                <p className="text-2xl neon-text font-bold">{nft.price} ETH</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-400">Creator</p>
                                <p className="text-gray-300 font-medium">
                                  {nft.creator?.slice(0, 6)}...{nft.creator?.slice(-4)}
                                </p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onNavigate('detail', nft.id)}
                              className="button-glow w-full py-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white font-bold"
                            >
                              View Details
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevSlide}
                  className="p-3 rounded-full glassmorphism"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                
                <div className="flex gap-2">
                  {featuredNFTs.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === index ? 'w-8 bg-[#8a6aff]' : 'w-2 bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextSlide}
                  className="p-3 rounded-full glassmorphism"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <StatCard
              icon={<TrendingUp className="w-8 h-8" />}
              value={`${stats.volume}K+`}
              label="Total Volume (ETH)"
              color="from-[#8a6aff] to-[#a78bfa]"
            />
            <StatCard
              icon={<Users className="w-8 h-8" />}
              value={`${Math.floor(stats.users / 1000)}K+`}
              label="Active Users"
              color="from-[#38bdf8] to-[#06b6d4]"
            />
            <StatCard
              icon={<Layers className="w-8 h-8" />}
              value={`${stats.collections}+`}
              label="NFT Collections"
              color="from-[#06b6d4] to-[#8a6aff]"
            />
          </div>
        </div>
      </section>

      {/* Trending NFTs */}
      <section className="py-20 px-4 mb-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl mb-12 text-center font-bold"
          >
            Trending <span className="neon-text">Now</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nfts.slice(0, 6).map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <NFTCard nft={nft} onClick={() => onNavigate('detail', nft.id)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="glassmorphism rounded-3xl p-8 text-center"
    >
      <div className={`mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${color} mb-4 text-white shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-4xl mb-2 neon-text font-bold">{value}</h3>
      <p className="text-gray-400 font-medium">{label}</p>
    </motion.div>
  );
}