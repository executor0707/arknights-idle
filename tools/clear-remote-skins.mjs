import fs from 'node:fs';
const p='build/app/js/skin-spine-remote.js';
fs.writeFileSync(p,'// All skins are bundled locally under assets/spine38/skins.\nexport const SKIN_SPINE_REMOTE = {};\n');
console.log('remote map emptied');
