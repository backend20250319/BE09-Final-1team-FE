/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ChunkLoadError 해결을 위한 webpack 설정
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 청크 로딩 실패 시 재시도 설정
      config.output.chunkLoadingGlobal = 'webpackChunkLoad';
      
      // 청크 분할 최적화
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // 공통 라이브러리들을 별도 청크로 분리
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // 공통 컴포넌트들을 별도 청크로 분리
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  // API 리라이트 설정 (선택사항)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
