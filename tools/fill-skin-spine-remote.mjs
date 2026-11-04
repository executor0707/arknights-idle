import fs from 'node:fs';
import { SKINS } from '../build/app/js/skins.js';
import { SPINE38_OPERATORS, SPINE35_ONLY } from '../build/app/js/spine38-index.js';
import { SKIN_SPINE_REMOTE } from '../build/app/js/skin-spine-remote.js';

const metaCache = new Map();
const out = { ...SKIN_SPINE_REMOTE };
const missing = SKINS.filter(s => !out[s.id]);
const unique = [...new Set(missing.map(s => {
  const base = SPINE38_OPERATORS[s.opId]?.base || SPINE35_ONLY[s.opId]?.base || '';
  const charId = base.split('/').pop();
  return charId || s.opId;
}))];
console.log('missing', missing.length, 'chars', unique.length);
let cursor = 0;
let added = 0;
async function worker() {
  while (cursor < unique.length) {
    const charId = unique[cursor++];
    let meta = null;
    for (let i = 0; i < 4 && !meta; i++) {
      try {
        const r = await fetch(`https://torappu.prts.wiki/assets/char_spine/${charId}/meta.json`, { signal: AbortSignal.timeout(30000) });
        if (!r.ok) throw new Error(r.status);
        meta = await r.json();
      } catch (e) { await new Promise(r => setTimeout(r, 600)); }
    }
    if (!meta) continue;
    metaCache.set(charId, meta);
    for (const s of missing) {
      const b = SPINE38_OPERATORS[s.opId]?.base || SPINE35_ONLY[s.opId]?.base || '';
      if (b.split('/').pop() !== charId) continue;
      let part = meta.skin?.[s.name];
      // Try a normalized name (full-width punctuation/spacing differences).
      if (!part) {
        const norm = x => String(x).replace(/[\s·・\-—_（）()]/g, '').toLowerCase();
        const hit = Object.keys(meta.skin || {}).find(k => norm(k) === norm(s.name));
        if (hit) part = meta.skin[hit];
      }
      const file = part?.['正面']?.file;
      if (file && !out[s.id]) { out[s.id] = { name: s.name, base: meta.prefix + file }; added++; }
    }
  }
}
await Promise.all(Array.from({ length: 10 }, worker));
fs.writeFileSync('build/app/js/skin-spine-remote.js', '// Remote PRTS battle-front skin Spine. Local files (SKIN_SPINE) override this map.\nexport const SKIN_SPINE_REMOTE = ' + JSON.stringify(out, null, 2) + ';\n');
console.log('added', added, 'total', Object.keys(out).length, '/', SKINS.length);
