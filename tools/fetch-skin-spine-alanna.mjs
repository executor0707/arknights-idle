import fs from 'node:fs';
import path from 'node:path';
const s = { id: 'char_4178_alanna-skin1', name: '赤土拉力', char: 'char_4178_alanna', base: 'char_4178_alanna_race_3/front/char_4178_alanna_race_3' };
const root = 'build/app/assets/spine38/skins';
const out = path.join(root, s.id);
fs.mkdirSync(out, { recursive: true });
for (const ext of ['.skel', '.atlas', '.png']) {
  const url = `https://torappu.prts.wiki/assets/char_spine/${s.char}/${s.base}${ext}`;
  let buf = null;
  for (let i = 0; i < 6 && !buf; i++) {
    try { const r = await fetch(url, { signal: AbortSignal.timeout(30000) }); if (!r.ok) throw new Error(r.status); buf = Buffer.from(await r.arrayBuffer()); }
    catch (e) { await new Promise(r => setTimeout(r, 700)); }
  }
  if (!buf) { console.log('FAIL', s.id, ext); continue; }
  fs.writeFileSync(path.join(out, path.basename(s.base) + ext), buf);
  console.log('ok', ext, buf.length);
}
const idxPath = 'build/app/js/skin-spine-index.js';
const old = fs.readFileSync(idxPath, 'utf8');
const idx = JSON.parse(old.slice(old.indexOf('{'), old.lastIndexOf('}') + 1));
idx[s.id] = { name: s.name, base: `assets/spine38/skins/${s.id}/${path.basename(s.base)}` };
fs.writeFileSync(idxPath, '// Skin battle-front Spine from PRTS torappu char_spine meta.\nexport const SKIN_SPINE = ' + JSON.stringify(idx, null, 2) + ';\n');
console.log(idx);
