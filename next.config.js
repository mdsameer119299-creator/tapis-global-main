/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rugsociety.eu',
        pathname: '/img/samples/**',
      },
    ],

    // Skip on-the-fly optimization in dev — major speedup for local `npm run dev`
    unoptimized: isDev,

    formats: isDev ? ['image/webp'] : ['image/avif', 'image/webp'],

    deviceSizes:  [640, 750, 828, 1080, 1200, 1920],
    imageSizes:   [32, 48, 64, 96, 128, 256],

    minimumCacheTTL: 604800,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'inline',
  },

  compress: true,

  // Reduce Windows dev cache corruption (ENOENT on .next/cache/webpack)
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig
