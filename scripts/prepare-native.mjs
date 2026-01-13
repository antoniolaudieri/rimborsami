import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', 'capacitor.config.ts');
let config = fs.readFileSync(configPath, 'utf8');

console.log('📄 Original config:\n', config);

// Remove the server section for production builds - more robust regex
// Matches: server: { ... } with optional trailing comma
config = config.replace(/,?\s*server:\s*\{[^}]*\},?/gs, '');

// Clean up any double commas or trailing commas before closing brace
config = config.replace(/,(\s*})/g, '$1');

console.log('📄 Modified config:\n', config);

fs.writeFileSync(configPath, config);
console.log('✅ Capacitor config prepared for production (server section removed)');
