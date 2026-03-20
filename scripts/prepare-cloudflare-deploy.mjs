import fs from 'node:fs';
import path from 'node:path';

const outputDir = '.open-next';
const workerPath = path.join(outputDir, 'worker.js');
const workerDestPath = path.join(outputDir, '_worker.js');
const assetsPath = path.join(outputDir, 'assets');
const routesPath = path.join(outputDir, '_routes.json');

const routesPayload = {
  version: 1,
  include: ['/*'],
  exclude: ['/_next/static/*', '/images/*', '/uploads/*']
};

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }

  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcEntry = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcEntry, destEntry);
    } else {
      fs.copyFileSync(srcEntry, destEntry);
    }
  }
}

if (!fs.existsSync(outputDir)) {
  throw new Error('Missing .open-next output. Run npm run cf:build first.');
}

if (fs.existsSync(workerDestPath)) {
  fs.rmSync(workerDestPath, { force: true });
}

if (fs.existsSync(workerPath)) {
  fs.renameSync(workerPath, workerDestPath);
}

copyRecursive(assetsPath, outputDir);
const wranglerIgnore = `
server-functions
middleware
dynamodb-provider
cloudflare
cloudflare-templates
cache
.build
worker.js
assets
`;
fs.writeFileSync(path.join(outputDir, '.wranglerignore'), wranglerIgnore, 'utf8');
fs.writeFileSync(routesPath, `${JSON.stringify(routesPayload)}\n`, 'utf8');

console.log('Prepared .open-next for Cloudflare Pages deployment.');
