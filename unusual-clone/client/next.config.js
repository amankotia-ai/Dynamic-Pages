/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Generate static output
  output: 'export',
  // Output directory
  distDir: 'build',
  // For static sites, we need to disable image optimization
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