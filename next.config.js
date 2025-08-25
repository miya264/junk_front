// next.config.js
const isDev = process.env.NODE_ENV !== 'production';
const PROD_API = process.env.NEXT_PUBLIC_API_ENDPOINT; // 例: https://your-fastapi.azurewebsites.net

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // ★ キャッシュ制御ヘッダ
  async headers() {
    return [
      // Next が吐くハッシュ付きビルド成果物（長期キャッシュOK）
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // public/images 配下などハッシュなしの静的ファイルは短め
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      // それ以外（HTML/SSR/APIなど）は都度取得
      {
        // _next/static と /images を除外して全体に適用
        source: '/((?!_next/static|images).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
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
