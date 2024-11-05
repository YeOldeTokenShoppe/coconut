/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Enable source maps in production
    if (!dev && !isServer) {
      config.devtool = "source-map";
    }

    return config;
  },
};
