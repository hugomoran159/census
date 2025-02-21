/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/vector_tiles_20250221_155454/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/x-protobuf'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 