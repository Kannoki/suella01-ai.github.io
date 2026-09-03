/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained server bundle under .next/standalone
  // so the Docker image can start with `node server.js` (no node_modules copy needed)
  output: 'standalone',

  // Allow images from external hosts used in seed data
  images: {
    domains: [
      's160-26-ava-talk.zadn.vn',
      'images.unsplash.com',
      'via.placeholder.com',
    ],
  },

  // Suppress noisy telemetry
  experimental: {},
};

export default nextConfig;
