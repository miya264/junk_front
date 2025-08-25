// next.config.js
const isDev = process.env.NODE_ENV !== 'production';
const PROD_API = process.env.NEXT_PUBLIC_API_ENDPOINT; // 例: https://your-fastapi.azurewebsites.net

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  async rewrites() {
    // dev は必ずローカル FastAPI へ、prod は ENV があればそこへ
    const target = isDev ? 'http://127.0.0.1:8001' : (PROD_API || null);

    if (!target) {
      console.warn('NEXT_PUBLIC_API_ENDPOINT not set for production; /api proxy disabled');
      return [];
    }

    const dest = target.replace(/\/$/, '');
    console.log('[rewrites] /api ->', dest);

    return [
      { source: '/api/:path*', destination: `${dest}/:path*` },
    ];
  },

  images: { unoptimized: true },
};

module.exports = nextConfig;
