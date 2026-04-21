import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // React strict mode catches subtle effect bugs in dev.
  reactStrictMode: true,
  // Drop `console.log` in production bundles to keep the client payload small.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Narrow server bundles — Prisma / bcrypt should stay external for perf.
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'puppeteer-core'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Prefer AVIF (smaller) then WebP; fall back to original for unsupported browsers.
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images at the CDN / browser for 7 days.
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // Only generate the SWC minifier output we actually ship.
  productionBrowserSourceMaps: false,
  experimental: {
    // Tree-shake named imports from these packages (massive size saving for icons).
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      'recharts',
    ],
  },
};

export default nextConfig;
