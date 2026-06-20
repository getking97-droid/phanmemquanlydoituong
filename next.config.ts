import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Bỏ qua lỗi TypeScript khi build
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  basePath: process.env.GITHUB_ACTIONS ? "/phanmemquanlydoituong" : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? "/phanmemquanlydoituong/" : "",
};

export default nextConfig;
