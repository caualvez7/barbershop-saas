import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "./",
  },
  // Otimiza a estabilidade e velocidade de compilação em desenvolvimento
  onDemandEntries: {
    maxInactiveAge: 2 * 60 * 60 * 1000, // Manter compilado por 2 horas
    pagesBufferLength: 20,              // Cache de até 20 páginas
  },
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
