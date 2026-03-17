import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep @prisma/client external from webpack so esbuild/wrangler can
  // bundle it correctly with the workerd runtime conditions.
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
};

initOpenNextCloudflareForDev();

export default nextConfig;
