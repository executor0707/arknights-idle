import fs from 'node:fs';
import path from 'node:path';
const id = 'ela-skin1';
const base = 'char_4123_ela_rainbow6_2/front/char_4123_ela_rainbow6_2';
const dir = path.join('build/app/assets/spine38/skins', id);
fs.mkdirSync(dir, { recursive: true });
for (const ext of ['.skel', '.atlas', '.png']) {
  const url = `https://torappu.prts.wiki/assets/char_spine/char_4123_ela/${base}${ext}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${ext} ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(path.join(dir, path.basename(base) + ext), buf);
  console.log('ok', ext, buf.length);
}
const p = 'build/app/js/skin-spine-index.js';
const old = fs.readFileSync(p, 'utf8');
const map = JSON.parse(old.slice(old.indexOf('{'), old.lastIndexOf('}') + 1));
map[id] = { name: '密室', base: `assets/spine38/skins/${id}/${path.basename(base)}` };
fs.writeFileSync(p, '// Skin battle-front Spine from PRTS torappu char_spine meta.\nexport const SKIN_SPINE = ' + JSON.stringify(map, null, 2) + ';\n');
const rp = 'build/app/js/skin-spine-remote.js';
const rOld = fs.readFileSync(rp, 'utf8');
const rMap = JSON.parse(rOld.slice(rOld.indexOf('{'), rOld.lastIndexOf('}') + 1));
delete rMap[id];
fs.writeFileSync(rp, '// Remote PRTS battle-front skin Spine. Local files (SKIN_SPINE) override this map.\nexport const SKIN_SPINE_REMOTE = ' + JSON.stringify(rMap, null, 2) + ';\n');
console.log('mapped locally');
