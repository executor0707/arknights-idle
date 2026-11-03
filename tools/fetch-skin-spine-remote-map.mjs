import fs from 'node:fs';
import { SKINS } from '../build/app/js/skins.js';

const byOp = new Map();
for (const s of SKINS) {
  if (!byOp.has(s.opId)) byOp.set(s.opId, []);
  byOp.get(s.opId).push(s);
}
const ops = [...byOp.keys()];
console.log('operators with skins', ops.length, 'skins', SKINS.length);
const out = {};
let done = 0;
let cursor = 0;
async function worker() {
  while (cursor < ops.length) {
    const opId = ops[cursor++];
    let meta = null;
    for (let i = 0; i < 3 && !meta; i++) {
      try {
        const r = await fetch(`https://torappu.prts.wiki/assets/char_spine/${opId}/meta.json`, { signal: AbortSignal.timeout(30000) });
        if (!r.ok) throw new Error(r.status);
        meta = await r.json();
      } catch (e) { await new Promise(r => setTimeout(r, 600)); }
    }
    if (meta?.skin) {
      for (const s of byOp.get(opId)) {
        const part = meta.skin[s.name];
        const file = part?.['正面']?.file;
        if (file) out[s.id] = { name: s.name, base: meta.prefix + file };
      }
    }
    done++;
    if (done % 25 === 0) console.log(done, '/', ops.length, Object.keys(out).length);
  }
}
await Promise.all(Array.from({ length: 14 }, worker));
fs.writeFileSync('build/app/js/skin-spine-remote.js', '// Remote PRTS battle-front skin Spine. Local files (SKIN_SPINE) override this map.\nexport const SKIN_SPINE_REMOTE = ' + JSON.stringify(out, null, 2) + ';\n');
console.log('mapped', Object.keys(out).length, '/', SKINS.length);
