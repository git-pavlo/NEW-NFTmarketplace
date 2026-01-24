import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Image as ImageIcon, Video, Sparkles } from 'lucide-react';
import { blockchains } from '../lib/mockData';
import { toast } from 'sonner@2.0.3';

interface CreateNFTPageProps {
  onNavigate: (page: string) => void;
}

export default function CreateNFTPage({ onNavigate }: CreateNFTPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    royalties: 10,
    blockchain: 'Ethereum',
    category: 'Art'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = () => {
    if (!uploadedFile || !formData.name) {
      toast.error('Please fill in all required fields', {
        description: 'Name and file upload are required',
        duration: 3000
      });
      return;
    }

    toast.success('NFT Minting Initiated!', {
      description: 'Your NFT is being created. This may take a few minutes.',
      duration: 3000
    });

    setTimeout(() => {
      toast.success('NFT Minted Successfully!', {
        description: 'Your NFT is now live on the marketplace',
        duration: 3000
      });
      onNavigate('profile');
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl mb-4">
            Create <span className="neon-text">Your NFT</span>
          </h1>
          <p className="text-gray-400">Upload your artwork and mint it as an NFT</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glassmorphism rounded-3xl p-6">
              <h3 className="text-xl mb-4">Upload File</h3>
              
              {/* Upload Area */}
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="block relative"
              >
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {!previewUrl ? (
                  <div className="border-2 border-dashed border-[rgba(138,106,255,0.3)] rounded-2xl p-12 text-center cursor-pointer hover:border-[rgba(138,106,255,0.6)] transition-all">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8a6aff] to-[#38bdf8] mb-4"
                    >
                      <Upload className="w-10 h-10" />
                    </motion.div>
                    <p className="text-lg mb-2">Drop your file here, or browse</p>
                    <p className="text-sm text-gray-400">PNG, JPG, GIF, MP4, Max 100MB</p>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden group">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full aspect-square object-cover"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p>Change File</p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.label>

              {/* File Info */}
              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 glassmorphism rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    {uploadedFile.type.startsWith('video') ? (
                      <Video className="w-5 h-5 text-[#38bdf8]" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#8a6aff]" />
                    )}
                    <div className="flex-1">
                      <p className="truncate">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right: Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Name */}
            <div className="glassmorphism rounded-3xl p-6">
              <label className="block mb-2">
                Name <span className="text-[#8a6aff]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cosmic Dream #001"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl glassmorphism focus-glow transition-all"
              />
            </div>

            {/* Description */}
            <div className="glassmorphism rounded-3xl p-6">
              <label className="block mb-2">Description</label>
              <textarea
                placeholder="Tell us about your NFT..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl glassmorphism focus-glow transition-all resize-none"
              />
            </div>

            {/* Category */}
            <div className="glassmorphism rounded-3xl p-6">
              <label className="block mb-2">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {['Art', 'Gaming', 'Photography', 'Music'].map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, category })}
                    className={`py-3 rounded-2xl transition-all ${
                      formData.category === category
                        ? 'bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white'
                        : 'glassmorphism hover:border-[rgba(138,106,255,0.5)]'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Royalties */}
            <div className="glassmorphism rounded-3xl p-6">
              <label className="block mb-2">
                Royalties (%)
                <span className="text-sm text-gray-400 ml-2">You'll earn this % on resales</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={formData.royalties}
                  onChange={(e) => setFormData({ ...formData, royalties: parseFloat(e.target.value) })}
                  className="flex-1"
                  style={{ accentColor: '#8a6aff' }}
                />
                <div className="w-16 text-center glassmorphism rounded-xl py-2 neon-text">
                  {formData.royalties}%
                </div>
              </div>
            </div>

            {/* Blockchain */}
            <div className="glassmorphism rounded-3xl p-6">
              <label className="block mb-2">Blockchain</label>
              <div className="grid grid-cols-2 gap-3">
                {blockchains.map((blockchain) => (
                  <motion.button
                    key={blockchain}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, blockchain })}
                    className={`py-3 rounded-2xl transition-all ${
                      formData.blockchain === blockchain
                        ? 'bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white'
                        : 'glassmorphism hover:border-[rgba(138,106,255,0.5)]'
                    }`}
                  >
                    {blockchain}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mint Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMint}
              className="button-glow w-full py-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Mint NFT
            </motion.button>

            <p className="text-center text-sm text-gray-400">
              Gas fees will be calculated at checkout
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
