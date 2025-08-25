// next.config.js - 静的サイト生成

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  
  images: { 
    unoptimized: true 
  },
};

module.exports = nextConfig;
