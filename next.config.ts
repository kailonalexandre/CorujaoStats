import type { NextConfig } from "next";

function getAllowedServerActionOrigins() {
  const origins = new Set(["localhost:8082", "127.0.0.1:8082"]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.DOCKER_NEXT_PUBLIC_APP_URL;

  if (appUrl) {
    try {
      origins.add(new URL(appUrl).host);
    } catch {
      // Ignore invalid local env values during build.
    }
  }

  return Array.from(origins);
}

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: getAllowedServerActionOrigins(),
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
