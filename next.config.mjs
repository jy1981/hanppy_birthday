/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      { source: '/baby-piano', destination: '/baby-piano/index.html' },
    ];
  },
};

export default nextConfig;
