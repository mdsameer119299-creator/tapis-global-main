/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  // Ensure the external Knowledge Centre content files (read via fs) are traced
  // into the serverless bundle for the routes that load them at runtime.
  experimental: {
    outputFileTracingIncludes: {
      '/api/tara': ['./content/knowledge/**/*'],
      '/knowledge': ['./content/knowledge/**/*'],
      '/knowledge/[slug]': ['./content/knowledge/**/*'],
    },
  },

  images: {
    // All site imagery is self-hosted under /public — the one exception is
    // CraftTrack's customer-facing media (cover photos, stage galleries),
    // uploaded to Vercel Blob at upload time and referenced by full URL.
    // Scoped to just that hostname — doesn't affect the admin panel's
    // existing plain <img> usage for the same URLs (deliberately left
    // unchanged, an internal tool used at a desk has a different
    // optimization/priority profile than this public, LCP-sensitive,
    // mobile-first customer experience).
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
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
        source: '/videos/:path*',
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
      {
        // /blogs superseded by the richer /guides authority cluster
        source:      '/blogs',
        destination: '/guides',
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
