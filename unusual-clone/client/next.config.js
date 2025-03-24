/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // We're using custom server configuration and static files
  distDir: 'build',
  // Use static generation to avoid document reference errors
  output: 'export',
  // For handling client-side routes
  trailingSlash: false,
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