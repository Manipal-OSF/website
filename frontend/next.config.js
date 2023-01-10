/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', process.env.SERVER_URL],
  },
};

module.exports = nextConfig;
