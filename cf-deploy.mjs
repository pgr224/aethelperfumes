import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building with OpenNext for Cloudflare...');
try {
    execSync('npm run cf:build', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
    console.error('Build failed', e);
    process.exit(1);
}

console.log('Preparing .open-next directory for Cloudflare Pages deploy...');
const openNextDir = path.join(__dirname, '.open-next');
const assetsDir = path.join(openNextDir, 'assets');

// 1. Ensure worker.js becomes _worker.js
const workerPath = path.join(openNextDir, 'worker.js');
const underscoreWorkerPath = path.join(openNextDir, '_worker.js');
if (fs.existsSync(workerPath)) {
    fs.copyFileSync(workerPath, underscoreWorkerPath);
}

// 2. Copy everything from assets/ to the root of .open-next/
// Node.js fs.cpSync supports recursive copying natively since v16.7.0
if (fs.existsSync(assetsDir)) {
    fs.cpSync(assetsDir, openNextDir, { recursive: true, force: true });
}

// 3. Create a .wranglerignore file
const wranglerIgnoreContent = `
server-functions
middleware
dynamodb-provider
cloudflare
cloudflare-templates
cache
.build
worker.js
`;
fs.writeFileSync(path.join(openNextDir, '.wranglerignore'), wranglerIgnoreContent);

console.log('Deploying to Cloudflare Pages...');
try {
    execSync('npx wrangler pages deploy .open-next --project-name aethelperfumes --commit-dirty=true', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
    console.error('Deploy failed', e);
    process.exit(1);
}
console.log('Deploy script completed.');
