// next.config.js
const API = process.env.NEXT_PUBLIC_API_ENDPOINT; // 例: https://<your-fastapi>.azurewebsites.net

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (!API) return []; // 未設定なら何もしない（②の方法を使う場合）
    const dest = API.replace(/\/$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${dest}/:path*`, // /api/... -> FastAPI へ
      },
    ];
  },
  images: { unoptimized: true }, // 画像最適化を使わない場合
};

module.exports = nextConfig;
