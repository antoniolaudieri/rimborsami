const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'capacitor.config.ts');
let config = fs.readFileSync(configPath, 'utf8');

// Remove the server section for production builds
config = config.replace(/,?\s*server:\s*\{[\s\S]*?cleartext:\s*true\s*\}/g, '');

fs.writeFileSync(configPath, config);
console.log('✅ Capacitor config prepared for production (server section removed)');
