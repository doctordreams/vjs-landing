import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for Vercel deployment (Vercel handles this automatically)
  // output: "standalone", // Commented out for Vercel compatibility
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,


};

export default nextConfig;
