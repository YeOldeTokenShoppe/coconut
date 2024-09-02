/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  images: {
    domains: ["pbs.twimg.com"],
  },
  webpack: (config, { isServer, dev }) => {
    // Enable source maps in production
    if (!dev && !isServer) {
      config.devtool = "source-map";
    }

    return config;
  },
};
