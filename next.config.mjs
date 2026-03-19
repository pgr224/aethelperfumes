/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@prisma/client'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3', 'pg', '@prisma/adapter-pg', '@prisma/adapter-better-sqlite3');
    }
    return config;
  },
};

export default nextConfig;
