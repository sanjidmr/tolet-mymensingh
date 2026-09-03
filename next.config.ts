import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  // The pre-Next.js (Vite) app treated `/home` and `/index.html` as the home
  // view, so old bookmarks/links pointed there. Send them to `/` instead of
  // showing the 404 page.
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: false,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: false,
      },
      {
        source: "/index.htm",
        destination: "/",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
};

export default nextConfig;
