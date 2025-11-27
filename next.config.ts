import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 experimental: {
    typedRoutes: false, // ⛔ disables strict route params checking
  },
};

export default nextConfig;
