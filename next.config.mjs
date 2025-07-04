/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/tonconnect-manifest.json',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/json',
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
      ],
    },
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  redirects: async () => [
    {
      source: '/',
      destination: '/transfer',
      permanent: true,
    },
  ],
}

export default nextConfig
