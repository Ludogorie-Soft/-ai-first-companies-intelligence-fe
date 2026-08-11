import type { NextConfig } from 'next';

// Where the Next server proxies /api/* to. Docker Compose passes the internal
// service URL (http://api:3001/api); local dev falls back to localhost.
const apiInternalUrl = process.env.API_INTERNAL_URL || 'http://localhost:3001/api';

const nextConfig: NextConfig = {
  // 'standalone' is only needed for the Docker image (Dockerfile copies
  // .next/standalone). On Vercel it is unnecessary — Vercel handles output itself.
  output: process.env.VERCEL ? undefined : 'standalone',
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
