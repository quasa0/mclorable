import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // remove standalone for vercel deployment
  // output: "standalone", 
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
  // increase build timeout
  experimental: {
    // increase build worker timeout
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
