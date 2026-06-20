import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Bỏ qua lỗi TypeScript khi build
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
