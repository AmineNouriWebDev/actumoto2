import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/modeles.html", destination: "/modeles", permanent: true },
      { source: "/occasion.html", destination: "/occasion", permanent: true },
      { source: "/comparateur.html", destination: "/comparateur", permanent: true },
      { source: "/coming-soon.html", destination: "/coming-soon", permanent: true },
      { source: "/actualite.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
