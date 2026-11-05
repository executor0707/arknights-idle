import fs from 'node:fs';
import path from 'node:path';
import { SPINE38_OPERATORS, SPINE35_ONLY } from '../build/app/js/spine38-index.js';

const id = 'char_4091_ulika';
const dir = path.join('build/app/assets/spine38/operators', id);
fs.mkdirSync(dir, { recursive: true });
for (const ext of ['.skel', '.atlas', '.png']) {
  const url = `https://torappu.prts.wiki/assets/char_spine/${id}/defaultskin/front/${id}${ext}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${ext} ${r.status}`);
  fs.writeFileSync(path.join(dir, id + ext), Buffer.from(await r.arrayBuffer()));
}
SPINE38_OPERATORS[id] = { base: `assets/spine38/operators/${id}/${id}`, name: 'U-Official' };
delete SPINE35_ONLY[id];
fs.writeFileSync('build/app/js/spine38-index.js',
  `// Generated Spine index. 卫戍协议 operators removed.\nexport const SPINE38_OPERATORS = ${JSON.stringify(SPINE38_OPERATORS, null, 2)};\n\nexport const SPINE35_ONLY = ${JSON.stringify(SPINE35_ONLY, null, 2)};\n`);
console.log('U-Official 3.8 installed', SPINE38_OPERATORS[id], !!SPINE35_ONLY[id]);
