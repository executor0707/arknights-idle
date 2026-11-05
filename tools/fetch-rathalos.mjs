import fs from 'node:fs';
import path from 'node:path';
import { SPINE38_OPERATORS, SPINE35_ONLY } from '../build/app/js/spine38-index.js';
const base = 'defaultskin/front/char_1030_noirc2';
const name = 'char_1030_noirc2';
const dir = path.join('build/app/assets/spine38/operators/rathalos_noir');
fs.mkdirSync(dir, { recursive: true });
for (const ext of ['.skel', '.atlas', '.png']) {
  const r = await fetch(`https://torappu.prts.wiki/assets/char_spine/char_1030_noirc2/${base}${ext}`, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(ext + ' ' + r.status);
  fs.writeFileSync(path.join(dir, name + ext), Buffer.from(await r.arrayBuffer()));
  console.log('ok', ext);
}
SPINE38_OPERATORS.rathalos_noir = { base: 'assets/spine38/operators/rathalos_noir/char_1030_noirc2', name: '火龙S黑角' };
delete SPINE35_ONLY.rathalos_noir;
fs.writeFileSync('build/app/js/spine38-index.js',
  `// Generated Spine index. 卫戍协议 operators removed.\nexport const SPINE38_OPERATORS = ${JSON.stringify(SPINE38_OPERATORS, null, 2)};\n\nexport const SPINE35_ONLY = ${JSON.stringify(SPINE35_ONLY, null, 2)};\n`);
console.log('index updated', SPINE38_OPERATORS.rathalos_noir, !!SPINE35_ONLY.rathalos_noir);
