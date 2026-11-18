import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
  async headers() {
    return [
      {
        // Uploaded/user-authored game content (Import Game + Code Studio builds).
        // This CSP forces the document into an opaque origin at the HTTP response
        // level, independent of the embedding <iframe sandbox> attribute, so the
        // content can never read PlayVerse cookies/localStorage even if the iframe
        // itself needs "allow-same-origin" to render at all in some browsers.
        source: "/uploads/games/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "sandbox allow-scripts allow-forms allow-pointer-lock" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
