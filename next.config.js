// next.config.js - 一時的に最小構成でテスト

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // キャッシュを無効化
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

  images: { unoptimized: true },
};

module.exports = nextConfig;
