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
  // Docker 최적화를 위한 standalone 모드 활성화
  output: 'standalone',
  // React 19 호환성을 위한 설정
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;