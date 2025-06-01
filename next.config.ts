
/** @type {import('next').NextConfig} */
const nextConfig = {

  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["rfjzb6pr-9002.inc1.devtunnels.ms", "localhost:9002"],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },    
    ],
  },
};

module.exports = nextConfig;