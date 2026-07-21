import type { NextConfig } from "next";

const basePath = process.env.GITHUB_PAGES === "true" ? "/MyPortfolio" : "";

const nextConfig: NextConfig = {
  output: process.env.GITHUB_PAGES === "true" ? "export" : undefined,
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;