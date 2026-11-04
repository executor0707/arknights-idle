import fs from 'node:fs';
import { SPINE38_OPERATORS, SPINE35_ONLY } from '../build/app/js/spine38-index.js';
SPINE38_OPERATORS.ela = { base: 'assets/spine38/operators/ela/char_4123_ela', name: '艾拉' };
fs.writeFileSync('build/app/js/spine38-index.js',
  `// Generated Spine index. 卫戍协议 operators removed.\nexport const SPINE38_OPERATORS = ${JSON.stringify(SPINE38_OPERATORS, null, 2)};\n\nexport const SPINE35_ONLY = ${JSON.stringify(SPINE35_ONLY, null, 2)};\n`);
console.log('updated', SPINE38_OPERATORS.ela);
