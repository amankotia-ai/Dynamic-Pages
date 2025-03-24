/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Static export configuration
  output: 'export',
  distDir: 'build',
  // For static sites, we need to disable image optimization
  images: {
    unoptimized: true,
  },
  // Ensure we don't try to statically generate API routes
  // which need to be server-side rendered
  trailingSlash: true,
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