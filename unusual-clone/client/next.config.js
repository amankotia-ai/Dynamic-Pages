/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // We're using custom server configuration and static files
  distDir: 'build',
  // Removing static export to generate routes-manifest.json
  // output: 'export',  // This was causing the routes-manifest.json to not be generated
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