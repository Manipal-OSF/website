/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
     // process.env.NEXT_PUBLIC_SERVER_URL.substring(8), // Remove https://
    ],
  },
};

module.exports = nextConfig;
