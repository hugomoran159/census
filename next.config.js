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
      },
      {
        // Add CORS headers for WebAssembly files
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          }
        ]
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Fix for tiny-worker and other Node.js specific modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        worker_threads: false,
        // Add any other Node.js built-ins that are causing issues
      };
      
      // Add WebAssembly support
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      };
    }

    return config;
  },
  // Disable the strict mode for now to help with compatibility
  reactStrictMode: false,
}

module.exports = nextConfig 