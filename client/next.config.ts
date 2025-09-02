import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
};

console.log("🧪 BUILD ENV:", process.env.NEXT_PUBLIC_BACKEND_URL);
export default nextConfig;
