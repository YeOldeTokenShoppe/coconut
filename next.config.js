/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  webpack: (config, { isServer, dev }) => {
    // Enable source maps in production
    if (!dev && !isServer) {
      config.devtool = "source-map";
    }

    return config;
  },
};
