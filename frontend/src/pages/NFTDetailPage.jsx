import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { getNFTContract, getMarketContract, MARKET_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from '@/utils/contract';
import { ethers } from 'ethers'
import { Heart, Share2, MoreHorizontal, TrendingUp, Clock, Gavel, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function NFTDetailPage({ nftId, onNavigate }) {
  const [userAddress, setUserAddress] = useState(null); 
  const [auctionData, setAuctionData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
  const [NFTstatus, setNFTStatus] = useState('');
  const [nft, setNft] = useState(null);
  const [price, setPrice] = useState('');
  const [auctionPrice, setAuctionPrice] = useState(''); // Starting Bid
  const [auctionDuration, setAuctionDuration] = useState(''); // Hours
  const [marketItem, setMarketItem] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');
  const [loading, setLoading] = useState(true); 
  const [bidAmount, setBidAmount] = useState('');
  const [pendingRefund, setPendingRefund] = useState('0');

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
          setAuctionData(activeAuction);
        } else if (foundMarketItem) {
          setNFTStatus(foundMarketItem.seller.toLowerCase() === address.toLowerCase() ? 'on-sale' : 'buynow');
        } else if (owner.toLowerCase() === address.toLowerCase()) {
          setNFTStatus('collected');
        } else {
          setNFTStatus('view-only');
        }

        setNft({ 
          id: nftId, 
          owner, 
          ...meta, 
          price: foundMarketItem ? foundMarketItem.price : 'Not for sale',
          priceHistory: meta.priceHistory || [
            { date: '2024-01-01', price: 0.5 },
            { date: '2024-02-01', price: 0.8 },
            { date: '2024-03-01', price: foundMarketItem ? parseFloat(foundMarketItem.price) : 0.8 }
          ]
        });
        setMarketItem(foundMarketItem);
      } catch (err) {
        console.error("Error loading NFT:", err);
      } finally {
        setLoading(false);
      }
    };
    loadNFTData();
  }, [nftId]);
  console.log(NFTstatus)

  useEffect(() => {
    const checkRefunds = async () => {
      if (!userAddress) return;
      try {
        const marketplace = await getMarketContract();
        const amount = await marketplace.pendingWithdrawals(userAddress);
        setPendingRefund(ethers.formatEther(amount));
      } 
      catch (e) { console.error(e); }
    };
    checkRefunds();
  }, [userAddress, nftId]);

  useEffect(() => {
    if (NFTstatus !== 'auction' || !auctionData) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = auctionData.endAt - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
      } else {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
          expired: false
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [NFTstatus, auctionData]);

  const handleSale = async () => {
    const nftContract = await getNFTContract();
    const marketplaceContract = await getMarketContract();
    try {
      if (!price) throw new Error("Enter price");

      toast.loading("Approve & list NFT...");

      console.log(nftContract)
      console.log(nftId)
      // approve
      await nftContract.approve(
        MARKET_CONTRACT_ADDRESS,
        nftId
      );

      // list
      const tx = await marketplaceContract.listItem(
        NFT_CONTRACT_ADDRESS,
        nftId,
        ethers.parseEther(price)
      );
      await tx.wait();

      toast.success("NFT listed successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.reason || err.message);
    }
  };

  const handleBuy = async () => {
    if (!marketItem) return toast.error("Listing not found");
    
    const toastId = toast.loading("Confirming purchase in wallet...");
    try {
      const marketplace = await getMarketContract();
      
      // marketplace.buyItem takes the itemId (e.g. 1, 2, 3...)
      const tx = await marketplace.buyItem(marketItem.itemId, {
        value: ethers.parseEther(marketItem.price.toString())
      });

      toast.loading("Transaction processing...", { id: toastId });
      await tx.wait();

      toast.success("NFT purchased successfully!", { id: toastId });
      onNavigate('marketplace');
    } catch (err) {
      toast.error(err.reason || err.message, { id: toastId });
    }
  };

  const handleCancel = async () => {
    if (!marketItem) return toast.error("No active listing to cancel");

    const toastId = toast.loading("Approving cancellation...");
    try {
      const marketplace = await getMarketContract();

      const tx = await marketplace.cancelItem(marketItem.itemId);
      
      toast.loading("Returning NFT to your wallet...", { id: toastId });
      await tx.wait();

      toast.success("Listing cancelled and NFT returned!", { id: toastId });
      onNavigate('profile');
    } catch (err) {
      toast.error(err.reason || err.message, { id: toastId });
    }
  };

  const handleStartAuction = async () => {
    try {
      if (!auctionPrice || !auctionDuration) return toast.error("Enter starting price and duration");
      const toastId = toast.loading("Initiating Auction: Part 1 - Listing NFT...");

      const nftContract = await getNFTContract();
      const marketplace = await getMarketContract();

      // 1. Approve
      await (await nftContract.approve(MARKET_CONTRACT_ADDRESS, nftId)).wait();
      // 2. List Item (to get itemId)
      const listTx = await marketplace.listItem(NFT_CONTRACT_ADDRESS, nftId, ethers.parseEther(auctionPrice));
      const receipt = await listTx.wait();
      
      // Extract itemId from logs
      const event = receipt.logs.map(log => {
        try { return marketplace.interface.parseLog(log); } catch (e) { return null; }
      }).find(e => e?.name === 'ItemListed');
      
      const newItemId = event.args.itemId;
      
      // 3. Start Auction
      toast.loading("Initiating Auction: Part 2 - Setting duration...", { id: toastId });
      const auctionTx = await marketplace.startAuction(newItemId, parseInt(auctionDuration));
      await auctionTx.wait();

      toast.success("Auction live!", { id: toastId });
    } catch (err) {
      toast.error(err.reason || err.message);
    }
  };

  const handleBid = async () => {
    try {
      if (!bidAmount || !marketItem) return;
      if (marketItem.seller.toLowerCase() === userAddress.toLowerCase()) {
        return toast.error("You cannot bid on your own auction.");
      }
      const marketplace = await getMarketContract();
      const tx = await marketplace.placeBid(marketItem.itemId, { value: ethers.parseEther(bidAmount) });
      toast.loading("Placing bid...");
      await tx.wait();
      toast.success("Bid placed successfully!");
      window.location.reload();
    } catch (err) {
      toast.error(err.reason || err.message);
    }
  };

  const handleEndAuction = async () => {
    const toastId = toast.loading("Settling auction and transferring assets...");
    try {
      const marketplace = await getMarketContract();
      const tx = await marketplace.endAuction(marketItem.itemId);
      await tx.wait();

      toast.success("Auction settled successfully!", { id: toastId });
      onNavigate('profile');
    } catch (err) {
      toast.error(err.reason || err.message, { id: toastId });
    }
  };

  const handleWithdrawRefund = async () => {
    const toastId = toast.loading("Claiming your refund...");
    try {
      const marketplace = await getMarketContract();
      const tx = await marketplace.withdrawRefund();
      await tx.wait();
      toast.success("Refund claimed!", { id: toastId });
      setPendingRefund('0');
    } catch (err) {
      toast.error(err.reason || err.message, { id: toastId });
    }
  };
  
  if (!nft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#8a6aff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading NFT details...</p>
        </div>
      </div>
    );
  }

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
            animate={{ opacity: 1, scale: 1 }}
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
                  {nft.categories}
                </span>
                <span className="px-4 py-1 rounded-full text-sm bg-white/10">
                  {NFTstatus === 'auction' ? 'Live Auction' : 'Fixed Price'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl neon-text mb-4">{nft.name} #{nftId}</h1>
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
                    {NFTstatus === 'auction' ? 'Current Bid' : 'Price'}
                  </p>
                  <p className="text-4xl neon-text">{nft.price} ETH</p>
                  <p className="text-gray-400 mt-1">≈ ${(nft.price * 2400).toFixed(2)} USD</p>
                </div>
                {NFTstatus === 'auction' && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">
                      {timeLeft.expired ? 'Auction Ended' : 'Ends in'}
                    </p>
                    <div className={`flex items-center gap-2 ${timeLeft.expired ? 'text-green-400' : 'text-[#8a6aff]'}`}>
                      <Clock className="w-5 h-5" />
                      <span className="text-xl font-mono">
                        {timeLeft.expired 
                          ? "Colose" 
                          : `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Functions */}
              {parseFloat(pendingRefund) > 0 && (
                <div className="glassmorphism p-4 rounded-2xl mb-6 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">You were outbid! Pendding Refund:</p>
                      <p className="text-xl font-bold">{pendingRefund} ETH</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleWithdrawRefund}
                      className="w-full button-glow flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white"
                    >
                      Claim Refund
                    </motion.button>
                  </div>
                </div>
              )}

              {NFTstatus === 'collected' && (
                <div className="flex gap-3">
                  {/* Fixed Sale */}
                  <div className="glassmorphism flex-1 py-4 px-4 rounded-2xl">
                    <p className="text-sm text-gray-400 mb-2">Fixed Price Sale</p>
                    <input 
                      type="text" 
                      placeholder="ETH" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      className="w-full px-4 py-3 rounded-2xl glassmorphism focus-glow transition-all my-4 mb-4" 
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSale}
                      className="w-full button-glow flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white"
                    >
                      List for Sale
                    </motion.button>
                  </div>
                  {/* Auction Sale */}
                  <div className="glassmorphism flex-1 py-4 px-4 rounded-2xl">
                    <p className="text-sm text-gray-400 mb-2">Start Auction</p>
                    <div className="w-full rounded-2xl focus-glow transition-all my-4 flex gap-3 mb-4">
                      <input 
                        type="text" 
                        placeholder="Start Bid" 
                        value={auctionPrice} 
                        onChange={(e) => setAuctionPrice(e.target.value)} 
                        className="w-full px-4 py-3 rounded-2xl glassmorphism focus-glow transition-all my-4" 
                      />
                      <input 
                        type="number" 
                        placeholder="Hours" 
                        value={auctionDuration} 
                        onChange={(e) => setAuctionDuration(e.target.value)} 
                        className="w-full px-4 py-3 rounded-2xl glassmorphism focus-glow transition-all my-4" 
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartAuction} 
                      className="w-full button-glow flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white"
                    >
                      <Gavel className="w-4 h-4" /> Start Auction
                    </motion.button>
                  </div>
                </div>
              )}
              {NFTstatus === 'on-sale' && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="button-glow flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white"
                  >
                    cancel
                  </motion.button>
                </div>
              )}
              {NFTstatus === 'buynow' && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuy}
                    className="button-glow flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white"
                  >
                    Buy Now
                  </motion.button>
                </div>
              )}
              {NFTstatus === 'auction' && (
                <div className="space-y-4">
                  {timeLeft.expired ? (
                    ((auctionData.highestBidder.toLowerCase() === userAddress?.toLowerCase() || 
                      marketItem?.seller.toLowerCase() === userAddress?.toLowerCase()) && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleEndAuction} 
                        className="button-glow flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white"
                      >
                        <CheckCircle className="w-5 h-5"/> Settle & Finalize Auction
                      </motion.button>
                    ))
                  ) : (
                    userAddress?.toLowerCase() !== marketItem?.seller.toLowerCase() && (
                      <div className="flex gap-3">
                        <input type="text" placeholder="Your bid (ETH)" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="flex-1 bg-white/5 p-4 rounded-2xl" />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleBid}
                          className="button-glow flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white"
                        >
                          Place Bid
                        </motion.button>
                      </div>
                    )
                  )}
                </div>
              )}
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
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }
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
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 capitalize transition-colors ${
                      activeTab === tab ? 'text-[#8a6aff] border-b-2 border-[#8a6aff]' : 'text-gray-400'
                    }`}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>

              <div className="p-6">
                {/* {activeTab === 'properties' && (
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
                )} */}

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
