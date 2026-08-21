import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Project documents (photos, PDFs) are uploaded as multipart Server
      // Action requests; raise the default 1MB cap to fit them.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
