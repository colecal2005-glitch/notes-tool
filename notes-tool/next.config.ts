import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Ensure prompt + corpus files are bundled into the serverless function on Vercel
  outputFileTracingIncludes: {
    "/api/generate": ["./prompts/**/*", "./data/corpus.json"],
  },
};

export default nextConfig;
