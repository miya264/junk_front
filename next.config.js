// next.config.js
const API = process.env.NEXT_PUBLIC_API_ENDPOINT; // 例: https://<your-fastapi>.azurewebsites.net

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ← これが無いと .next/standalone は作られません
  output: 'standalone',

  // どちらかの運用にしてください:
  // A) ここで /api を FastAPI に中継（rewrite）
  async rewrites() {
    if (!API) return []; // 環境変数未設定なら rewrite はしない
    const dest = API.replace(/\/$/, '');
    return [
      { source: '/api/:path*', destination: `${dest}/:path*` },
    ];
  },

  images: { unoptimized: true },
};

module.exports = nextConfig;
