// next.config.js
const API = process.env.NEXT_PUBLIC_API_ENDPOINT; // 例: https://<your-fastapi>.azurewebsites.net

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ← .next/standalone を必ず出力

  // /api/* を FastAPI にプロキシ（ENV が無い時は作らない）
  async rewrites() {
    if (!API) {
      console.warn('NEXT_PUBLIC_API_ENDPOINT not set at build; /api proxy disabled');
      return [];
    }
    const dest = API.replace(/\/$/, '');
    return [{ source: '/api/:path*', destination: `${dest}/:path*` }];
  },

  images: { unoptimized: true },
};

module.exports = nextConfig;
