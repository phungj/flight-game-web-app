import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    basePath: '/~phungj/flight',
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
