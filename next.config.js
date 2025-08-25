// next.config.js - 静的サイト生成に変更

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  
  images: { 
    unoptimized: true 
  },
  
  // 静的ファイルでもキャッシュを制御
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
