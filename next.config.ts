import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    // Local-only proxy when the browser calls relative `/api/*`.
    // On Vercel, set NEXT_PUBLIC_API_URL to the real API (…/api) instead.
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
