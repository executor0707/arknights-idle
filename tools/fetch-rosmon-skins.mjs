import fs from 'node:fs';
import path from 'node:path';
const skins = [
  { id: 'char_391_rosmon-skin1', name: '拥抱新生', base: 'char_391_rosmon_epoque_17/front/char_391_rosmon_epoque_17' },
  { id: 'char_391_rosmon-skin2', name: '轻盈一梦', base: 'char_391_rosmon_sale_16/front/char_391_rosmon_sale_16' },
];
const p = 'build/app/js/skin-spine-index.js';
const old = fs.readFileSync(p, 'utf8');
const map = JSON.parse(old.slice(old.indexOf('{'), old.lastIndexOf('}') + 1));
for (const s of skins) {
  const dir = path.join('build/app/assets/spine38/skins', s.id);
  fs.mkdirSync(dir, { recursive: true });
  for (const ext of ['.skel', '.atlas', '.png']) {
    const url = `https://torappu.prts.wiki/assets/char_spine/char_391_rosmon/${s.base}${ext}`;
    let buf = null;
    for (let i = 0; i < 5 && !buf; i++) {
      try { const r = await fetch(url, { signal: AbortSignal.timeout(30000) }); if (!r.ok) throw new Error(r.status); buf = Buffer.from(await r.arrayBuffer()); }
      catch (e) { await new Promise(r => setTimeout(r, 600)); }
    }
    if (!buf) { console.log('FAIL', s.id, ext); continue; }
    fs.writeFileSync(path.join(dir, path.basename(s.base) + ext), buf);
    console.log('ok', s.id, ext, buf.length);
  }
  map[s.id] = { name: s.name, base: `assets/spine38/skins/${s.id}/${path.basename(s.base)}` };
}
fs.writeFileSync(p, '// Skin battle-front Spine from PRTS torappu char_spine meta.\nexport const SKIN_SPINE = ' + JSON.stringify(map, null, 2) + ';\n');
console.log('local skins', Object.keys(map).length);
