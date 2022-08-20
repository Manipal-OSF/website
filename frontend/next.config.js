/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'osf-site-cms.herokuapp.com'],
  },
};

module.exports = nextConfig;
