import fs from 'node:fs';
import path from 'node:path';

const extra = [
  { id: 'char_4009_irene-skin1', name: '飞羽', char: 'char_4009_irene', base: 'char_4009_irene_ambiencesynesthesia_3/front/char_4009_irene_ambienceSynesthesia_3' },
  { id: 'char_4132_ascln-skin1', name: '趋光之暗', char: 'char_4132_ascln', base: 'char_4132_ascln_iteration_4/front/char_4132_ascln_iteration_4' },
  { id: 'char_291_aglina-skin1', name: '质素访客', char: 'char_291_aglina', base: 'char_291_aglina_boc_1/front/char_291_aglina_boc_1' },
];
const root = 'build/app/assets/spine38/skins';
const idxPath = 'build/app/js/skin-spine-index.js';
const old = fs.readFileSync(idxPath, 'utf8');
const jsonStart = old.indexOf('{');
const idx = JSON.parse(old.slice(jsonStart, old.lastIndexOf('}') + 1));
for (const s of extra) {
  const out = path.join(root, s.id);
  fs.mkdirSync(out, { recursive: true });
  for (const ext of ['.skel', '.atlas', '.png']) {
    const url = `https://torappu.prts.wiki/assets/char_spine/${s.char}/${s.base}${ext}`;
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
fs.writeFileSync(idxPath, '// Skin battle-front Spine from PRTS torappu char_spine meta.\nexport const SKIN_SPINE = ' + JSON.stringify(idx, null, 2) + ';\n');
console.log(JSON.stringify(idx, null, 2));
