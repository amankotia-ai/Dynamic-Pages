/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // We're using custom server configuration and static files
  distDir: 'build',
  // For handling client-side routes
  trailingSlash: false,
  // Ensure all SPA routes are handled by the main index.js page
  async rewrites() {
    return [
      // Handle all SPA routes
      {
        source: '/:path*',
        destination: '/',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: 'text/html',
          },
        ],
      },
    ];
  },
  // Images configuration
  images: {
    unoptimized: true,
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