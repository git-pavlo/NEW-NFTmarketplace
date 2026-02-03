import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import WalletModal from './WalletModal';

export default function Navbar({ currentPage, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-[rgba(138,106,255,0.2)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center cursor-pointer"
              onClick={() => onNavigate('landing')}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8a6aff] to-[#38bdf8] flex items-center justify-center">
                  <span className="text-white">NFT</span>
                </div>
                <span className="text-xl neon-text">NFT Market</span>
              </div>
            </motion.div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search NFTs, collections, or creators"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl glassmorphism focus-glow transition-all"
                />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              <NavLink
                active={currentPage === 'allnfts'}
                onClick={() => onNavigate('allnfts')}
              >
                All NFTs
              </NavLink>
              <NavLink
                active={currentPage === 'marketplace'}
                onClick={() => onNavigate('marketplace')}
              >
                Marketplace
              </NavLink>
              <NavLink
                active={currentPage === 'create'}
                onClick={() => onNavigate('create')}
              >
                Create
              </NavLink>
              <NavLink
                active={currentPage === 'profile'}
                onClick={() => onNavigate('profile')}
              >
                Profile
              </NavLink>
            </div>

            {/* Wallet Connect Button */}
            <WalletModal  />
          </div>
        </div>
      </motion.nav>

    </>
  );
}

function NavLink({ children, active, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`relative px-3 py-2 transition-colors ${
        active ? 'text-[#8a6aff]' : 'text-gray-300 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8a6aff] to-[#38bdf8]"
        />
      )}
    </motion.button>
  );
}
