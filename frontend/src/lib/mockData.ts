export interface NFT {
  id: string;
  name: string;
  image: string;
  price: number;
  owner: string;
  creator: string;
  category: string;
  status: 'buy-now' | 'auction';
  likes: number;
  description: string;
  royalties: number;
  properties: { trait: string; value: string }[];
  priceHistory: { date: string; price: number }[];
}

export const mockNFTs: NFT[] = [
  {
    id: '1',
    name: 'Cosmic Dream #4521',
    image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800&q=80',
    price: 2.5,
    owner: '0x742d...5e58',
    creator: '0x8a3f...2c91',
    category: 'Art',
    status: 'buy-now',
    likes: 245,
    description: 'A mesmerizing journey through the cosmos, this NFT represents the infinite possibilities of digital art.',
    royalties: 10,
    properties: [
      { trait: 'Background', value: 'Cosmic Purple' },
      { trait: 'Rarity', value: 'Legendary' },
      { trait: 'Edition', value: '1/1' }
    ],
    priceHistory: [
      { date: '2024-01-15', price: 1.8 },
      { date: '2024-01-18', price: 2.1 },
      { date: '2024-01-20', price: 1.9 },
      { date: '2024-01-22', price: 2.3 },
      { date: '2024-01-24', price: 2.5 }
    ]
  },
  {
    id: '2',
    name: 'Neon Genesis #1337',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80',
    price: 3.8,
    owner: '0x9b2c...7f42',
    creator: '0x5d1a...8e63',
    category: 'Gaming',
    status: 'auction',
    likes: 512,
    description: 'Enter the neon-lit world of cyberpunk aesthetics and futuristic gaming.',
    royalties: 7.5,
    properties: [
      { trait: 'Type', value: 'Gaming Avatar' },
      { trait: 'Level', value: 'Epic' },
      { trait: 'Power', value: '9500' }
    ],
    priceHistory: [
      { date: '2024-01-15', price: 2.5 },
      { date: '2024-01-18', price: 3.2 },
      { date: '2024-01-20', price: 3.0 },
      { date: '2024-01-22', price: 3.5 },
      { date: '2024-01-24', price: 3.8 }
    ]
  },
  {
    id: '3',
    name: 'Ethereal Vision #888',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
    price: 1.9,
    owner: '0x3e7d...9a21',
    creator: '0x7c8b...4f56',
    category: 'Abstract',
    status: 'buy-now',
    likes: 189,
    description: 'An abstract exploration of light, color, and digital consciousness.',
    royalties: 5,
    properties: [
      { trait: 'Style', value: 'Abstract' },
      { trait: 'Mood', value: 'Ethereal' },
      { trait: 'Colors', value: 'Rainbow' }
    ],
    priceHistory: [
      { date: '2024-01-15', price: 1.5 },
      { date: '2024-01-18', price: 1.7 },
      { date: '2024-01-20', price: 1.6 },
      { date: '2024-01-22', price: 1.8 },
      { date: '2024-01-24', price: 1.9 }
    ]
  },
  {
    id: '4',
    name: 'Digital Landscape #2048',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    price: 4.2,
    owner: '0x6f2a...3d78',
    creator: '0x1b9e...5c42',
    category: 'Photography',
    status: 'buy-now',
    likes: 678,
    description: 'A stunning digital landscape that blurs the line between reality and imagination.',
    royalties: 12,
    properties: [
      { trait: 'Resolution', value: '8K' },
      { trait: 'Format', value: 'Landscape' },
      { trait: 'Season', value: 'Winter' }
    ],
    priceHistory: [
      { date: '2024-01-15', price: 3.2 },
      { date: '2024-01-18', price: 3.8 },
      { date: '2024-01-20', price: 3.9 },
      { date: '2024-01-22', price: 4.0 },
      { date: '2024-01-24', price: 4.2 }
    ]
  },
  {
    id: '5',
    name: 'Quantum Flux #7777',
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80',
    price: 5.5,
    owner: '0x8d4c...2b91',
    creator: '0x4a7f...6e33',
    category: 'Art',
    status: 'auction',
    likes: 892,
    description: 'Experience the quantum realm through vibrant colors and dynamic patterns.',
    royalties: 15,
    properties: [
      { trait: 'Dimension', value: 'Quantum' },
      { trait: 'Energy', value: 'Ultra High' },
      { trait: 'Rarity', value: 'Mythic' }
    ],
    priceHistory: [
      { date: '2024-01-15', price: 4.0 },
      { date: '2024-01-18', price: 4.8 },
      { date: '2024-01-20', price: 5.0 },
      { date: '2024-01-22', price: 5.3 },
      { date: '2024-01-24', price: 5.5 }
    ]
  },
  {
    id: '6',
    name: 'Cyber Punk City #3030',
    image: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&q=80',
    price: 2.8,
    owner: '0x2c5e...8f67',
    creator: '0x9d3b...1a45',
    category: 'Gaming',
    status: 'buy-now',
    likes: 423,
    description: 'Navigate the neon streets of a futuristic metropolis in this immersive NFT.',
    royalties: 8,
    properties: [
      { trait: 'Setting', value: 'Urban' },
      { trait: 'Time', value: 'Night' },
      { trait: 'Tech Level', value: 'Advanced' }
    ],
    priceHistory: [
      { date: '2024-01-15', price: 2.0 },
      { date: '2024-01-18', price: 2.3 },
      { date: '2024-01-20', price: 2.5 },
      { date: '2024-01-22', price: 2.7 },
      { date: '2024-01-24', price: 2.8 }
    ]
  }
];

export const categories = ['All', 'Art', 'Gaming', 'Photography', 'Abstract', 'Music'];

