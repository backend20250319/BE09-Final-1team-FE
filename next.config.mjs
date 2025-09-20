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

  async rewrites() {
    // 빌드 시점에는 기본값(Localhost) 사용
    // 실행 시점에는 EB에서 설정한 NEXT_PUBLIC_API_URL로 덮어씌워짐
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
