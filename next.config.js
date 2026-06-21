/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  images: {
    // All imagery is now self-hosted under /public — no remote patterns required.

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

  async headers() {
    return [
      {
        source: '/logos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/swatches/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.webp',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source:      '/samples',
        destination: '/design-studio',
        permanent:   true,
      },
    ]
  },

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

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
