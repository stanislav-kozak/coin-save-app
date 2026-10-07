import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');

const apiTarget = process.env.API_PROXY_TARGET ?? 'https://app.coinsavekeeper.com';

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (see Dockerfile).
  output: 'standalone',
  // Socket.IO's path is `/socket.io/` — Next would 308 it to `/socket.io`, which the backend doesn't serve.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Browser talks to /api on its own origin, so the backend's Secure httpOnly cookies stay first-party.
    // Socket.IO too (spec §8): same origin, cookies included. Note the backend accepts only its own
    // Origin, so a local dev server against prod gets FORBIDDEN_ORIGIN — realtime is verified on prod.
    return [
      { source: '/api/:path*', destination: `${apiTarget}/api/:path*` },
      { source: '/socket.io/', destination: `${apiTarget}/socket.io/` },
      { source: '/socket.io/:path*', destination: `${apiTarget}/socket.io/:path*` },
    ];
  },
};

export default withNextIntl(nextConfig);
