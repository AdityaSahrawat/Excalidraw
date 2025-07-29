import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  /* config options here */
  reactStrictMode: false,
};
console.log("🧪 BUILD ENV:", process.env.NEXT_PUBLIC_BACKEND_URL);
export default nextConfig;
