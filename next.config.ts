import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/plans",
        destination: "/dashboard/client/plans",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
