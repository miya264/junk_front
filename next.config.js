// next.config.js
const isDev = process.env.NODE_ENV !== 'production';
const PROD_API = process.env.NEXT_PUBLIC_API_ENDPOINT; // 例: https://your-fastapi.azurewebsites.net

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // ★ キャッシュ制御ヘッダ（一時的に無効化）
  async headers() {
    return [
      // 全てのファイルでキャッシュを無効化（デバッグ用）
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },

  // ★ API リライト（dev: ローカル, prod: ENV）
  async rewrites() {
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
