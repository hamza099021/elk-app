/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs', 'ws', '@google/genai']
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/api/ai/gemini/realtime',
        headers: [
          { key: 'Upgrade', value: 'websocket' },
          { key: 'Connection', value: 'Upgrade' }
        ]
      }
    ]
  },
}

module.exports = nextConfig