import { useState } from 'react';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import MarketplacePage from './pages/MarketplacePage';
import NFTDetailPage from './pages/NFTDetailPage';
import CreateNFTPage from './pages/CreateNFTPage';
import UserProfilePage from './pages/UserProfilePage';
import { useAccount, useDisconnect } from "wagmi";
import { motion } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedNFTId, setSelectedNFTId] = useState('1');
  const { isConnected, address } = useAccount();

  const handleNavigate = (page, nftId) => {
    setCurrentPage(page);
    if (nftId) {
      setSelectedNFTId(nftId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSection = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;

      case 'marketplace':
        return (
          <MarketplacePage onNavigate={handleNavigate} />
        );

      case 'profile':
        if (!isConnected) {
          return (
            <div className="container mx-auto px-6 py-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <h2 className="text-2xl mb-4 text-gray-300">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-400 mb-6">
                  Please connect your wallet to view your NFT collection.
                </p>
              </motion.div>
            </div>
          );
        }

        return (
          <UserProfilePage onNavigate={handleNavigate} />
        );

      case 'create':
        if (!isConnected) {
          return (
            <div className="container mx-auto px-6 py-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <h2 className="text-2xl mb-4 text-gray-300">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-400 mb-6">
                  Please connect your wallet to mint new NFTs.
                </p>
              </motion.div>
            </div>
          );
        }

        return (
          <CreateNFTPage onNavigate={handleNavigate} />
        );

      case 'detail':
        return <NFTDetailPage nftId={selectedNFTId} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0a0b14] text-white">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main>{renderSection()}</main>

      <Toaster 
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(15, 17, 30, 0.95)',
            border: '1px solid rgba(138, 106, 255, 0.3)',
            color: '#e8e9f3',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)'
          }
        }}
      />
    </div>
  );
}
