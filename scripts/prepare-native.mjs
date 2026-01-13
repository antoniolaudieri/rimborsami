import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', 'capacitor.config.ts');
let config = fs.readFileSync(configPath, 'utf8');

// Remove the server section for production builds
config = config.replace(/,?\s*server:\s*\{[\s\S]*?cleartext:\s*true\s*\}/g, '');

fs.writeFileSync(configPath, config);
console.log('✅ Capacitor config prepared for production (server section removed)');
