import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, Image as ImageIcon, Video, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import axios from 'axios';
import { getNFTContract, NFT_CONTRACT_ADDRESS } from '../utils/contract';

// ⚠️ Move these to .env for production
const PINATA_API_KEY = '18233f0e183ee1001af1';
const PINATA_SECRET_KEY = 'f1a15a17e13a181c164df487dc382ac695bdcea8e1edf97b8dfa403148102022';

export default function CreateNFTPage() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Art',
    royalties: 5 // Default 5%
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4YzU2NzE2Ny0wNDhhLTQzYjMtODVmZi1iMzA3YjI2MDBhZjgiLCJlbWFpbCI6ImNyaXN0b3BlcmhhcnJ5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxODIzM2YwZTE4M2VlMTAwMWFmMSIsInNjb3BlZEtleVNlY3JldCI6ImYxYTE1YTE3ZTEzYTE4MWMxNjRkZjQ4N2RjMzgyYWM2OTViZGNlYThlMWVkZjk3YjhkZmE0MDMxNDgxMDIwMjIiLCJleHAiOjE4MDA4MTQ4MzR9.-LH5t446clO7-hXp5IdLpEfNd3dVU95civ6cTW1_24Q";

  const uploadToIPFS = async () => {
    try {
      // 1. Prepare File Data
      console.log(PINATA_API_KEY)
      console.log(PINATA_SECRET_KEY)
      const fileData = new FormData();
      console.log(uploadedFile)
      fileData.append('file', uploadedFile);

      // // Optional: Add Pinata Metadata to help the server process it faster
      // const metadata = JSON.stringify({
      //   name: formData.name,
      // });
      // fileData.append('pinataMetadata', metadata);

      // const options = JSON.stringify({
      //   cidVersion: 0,
      // });
      // fileData.append('pinataOptions', options);
      // console.log(fileData);

      // 2. Upload Image using Axios (Better for large files/timeouts)
      const fileRes = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        fileData,
        {
          headers: {
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY,
          },
          // Maximize timeout to 10 minutes
          timeout: 600000, 
        }
      );
      console.log("hi")
      const fileUrl = `https://gateway.pinata.cloud/ipfs/${fileRes.data.IpfsHash}`;

      // 3. Upload Metadata JSON
      const metadataBody = {
        name: formData.name,
        description: formData.description,
        image: fileUrl,
        categories: [formData.category],
        attributes: [{ trait_type: "Royalty", value: `${formData.royalties}%` }]
      };

      const metaRes = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadataBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_SECRET_KEY,
          },
        }
      );

      return {
        tokenURI: `https://gateway.pinata.cloud/ipfs/${metaRes.data.IpfsHash}`,
        fileUrl
      };
    } catch (error) {
      console.error("IPFS Upload Error Detail:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.details || "IPFS Upload Failed. If file is large, please wait or check your network.");
    }
  };

  const handleMint = async () => {
    if (!uploadedFile || !formData.name || !formData.description) return toast.error('Please fill in all required fields');
    
    try {
      setLoading(true);
      const contract = await getNFTContract();
      const signer = contract.runner;
      const walletAddress = await signer.getAddress();

      console.log("walletAddress>>>", walletAddress);

      // IPFS Upload phase
      toast.info("Uploading assets to IPFS...");
      const { tokenURI, fileUrl } = await uploadToIPFS();

      // Minting phase
      toast.info("Awaiting wallet confirmation...");
      const royaltyBps = Math.floor(formData.royalties * 100);
      
      const tx = await contract.mint(tokenURI, walletAddress, royaltyBps);
      const receipt = await tx.wait();

      // Parse logs to find TokenId (from Transfer event)
      const transferLog = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'Transfer';
        } catch { return false; }
      });

      const tokenId = contract.interface.parseLog(transferLog).args.tokenId.toString();

      toast.success(`Succesfully minted NFT #${tokenId}!`);

      // UX: Prompt MetaMask to track the new NFT
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC721',
              options: {
                address: NFT_CONTRACT_ADDRESS,
                tokenId: tokenId,
                symbol: 'NNFT',
                image: fileUrl,
              },
            },
          });
        } catch (e) { console.log("User declined asset tracking prompt"); }
      }

      // Reset Form
      setUploadedFile(null);
      setPreviewUrl(null);
      setFormData({ name: '', description: '', category: 'Art', royalties: 5 });
      
    } catch (err) {
      console.error(err);
      toast.error(err.reason || 'Minting failed. Check console for details.');
    } finally {
      setLoading(false);
    }
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
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glassmorphism rounded-3xl p-6">
              <h3 className="text-xl mb-4">Upload File</h3>
              <motion.label whileHover={{ scale: 1.02 }} className="block relative">
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

          {/* Form Section */}
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-2xl glassmorphism focus-glow transition-all"
              />
            </div>

            {/* Description */}
            <div className="glassmorphism rounded-3xl p-6">
              <label className="block mb-2">Description</label>
              <textarea
                placeholder="Tell us about your NFT..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
                <span className="text-sm text-gray-400 ml-2">
                  You'll earn this % on resales
                </span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={formData.royalties}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      royalties: parseFloat(e.target.value)
                    })
                  }
                  className="flex-1"
                  style={{ accentColor: '#8a6aff' }}
                />
                <div className="w-16 text-center glassmorphism rounded-xl py-2 neon-text">
                  {formData.royalties}%
                </div>
              </div>
            </div>

            {/* Mint Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMint}
              disabled={loading}
              className="button-glow w-full py-4 rounded-2xl bg-gradient-to-r from-[#8a6aff] to-[#38bdf8] text-white flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {loading ? "Minting..." : "Mint NFT"}
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
