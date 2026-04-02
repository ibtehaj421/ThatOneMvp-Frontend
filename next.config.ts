import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy all /api/* requests to the Go backend to avoid CORS issues in development.
  async rewrites() {
    return [
      // AI service proxy must come first (more specific match)
      {
        source: "/api/ai/:path*",
        destination: "http://localhost:8000/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;
