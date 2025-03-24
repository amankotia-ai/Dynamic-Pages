/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // We're using custom server configuration and static files
  distDir: 'build',
  // Configure asset prefix to ensure scripts are properly served
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // Setting custom output directory for static files
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Configure trailing slash
  trailingSlash: false,
  // Configure headers for CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-client-info' },
        ],
      },
      {
        source: '/scripts/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
  // Configure rewrites for clean URLs
  async rewrites() {
    return [
      {
        source: '/unusual-clone/scripts/unusual.js',
        destination: '/scripts/unusual.js',
      },
    ];
  },
  // Configure webpack to handle pure client-side dependencies
  webpack: (config, { isServer }) => {
    // Fix for using process.browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 