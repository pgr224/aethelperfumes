/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep @prisma/client external from webpack if needed
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
};

export default nextConfig;
