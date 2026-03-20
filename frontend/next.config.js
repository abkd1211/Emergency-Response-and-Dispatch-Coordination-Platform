/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.mapbox.com' },
      { protocol: 'https', hostname: 'api.mapbox.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:          process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DISPATCH_WS_URL:  process.env.NEXT_PUBLIC_DISPATCH_WS_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN:     process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
};

module.exports = nextConfig;
