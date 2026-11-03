import fs from 'node:fs';
import path from 'node:path';

const skins = [
  { id: 'char_1001_amiya2-skin1', name: '触及星辰', dir: 'char_1001_amiya2_casc_1', base: 'char_1001_amiya2_casc_1/front/char_1001_amiya2_casc_1' },
  { id: 'char_1001_amiya2-skin2', name: '于万千宇宙之中', dir: 'char_1001_amiya2_sale_16', base: 'char_1001_amiya2_sale_16/front/char_1001_amiya2_sale_16' },
];
const root = 'build/app/assets/spine38/skins';
fs.mkdirSync(root, { recursive: true });
const idx = {};
for (const s of skins) {
  const out = path.join(root, s.id);
  fs.mkdirSync(out, { recursive: true });
  for (const ext of ['.skel', '.atlas', '.png']) {
    const url = `https://torappu.prts.wiki/assets/char_spine/char_1001_amiya2/${s.base}${ext}`;
    let buf = null;
    for (let i = 0; i < 6 && !buf; i++) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!r.ok) throw new Error(r.status);
        buf = Buffer.from(await r.arrayBuffer());
      } catch (e) { await new Promise(r => setTimeout(r, 700)); }
    }
    if (!buf) { console.log('FAIL', s.id, ext); continue; }
    fs.writeFileSync(path.join(out, path.basename(s.base) + ext), buf);
    console.log('ok', s.id, ext, buf.length);
  }
  idx[s.id] = { name: s.name, base: `assets/spine38/skins/${s.id}/${path.basename(s.base)}` };
}
fs.writeFileSync('build/app/js/skin-spine-index.js', '// Pilot: PRTS torappu char_spine meta, battle-front skin assets.\nexport const SKIN_SPINE = ' + JSON.stringify(idx, null, 2) + ';\n');
console.log(idx);
