import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Brief 17.1 / 19: never hide type failures to make a build pass.
  // Note: Next 16 removed the `eslint` config key; linting runs as its own
  // `npm run lint` step instead of during `next build`.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
