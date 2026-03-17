import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent webpack from bundling these packages using Node.js export conditions.
  // @opennextjs/cloudflare's esbuild step will re-resolve them with the
  // "workerd" condition, which picks up @prisma/client/edge.js (static .wasm
  // import via wasm-worker-loader.mjs) instead of index.js (dynamic
  // new WebAssembly.Module() — blocked by Cloudflare Workers CSP).
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
  ],
};

initOpenNextCloudflareForDev();

export default nextConfig;
