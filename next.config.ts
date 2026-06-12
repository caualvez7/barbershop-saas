import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimiza o parsing de pacotes pesados compilando estritamente os submódulos importados
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'gsap', 'three'],
  },
  // Reduz a complexidade dos Source Maps em desenvolvimento para economizar até 50% de Heap RAM
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'eval-cheap-module-source-map';
    }
    return config;
  },
};

export default nextConfig;
