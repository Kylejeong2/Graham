/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tecdn.b-cdn.net'], // Add the domain for your image sources
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;