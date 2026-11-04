import fs from 'node:fs';
import path from 'node:path';
const id = 'ela';
const base = 'defaultskin/front/char_4123_ela';
const dir = path.join('build/app/assets/spine38/operators/ela');
fs.mkdirSync(dir, { recursive: true });
for (const ext of ['.skel', '.atlas', '.png']) {
  const url = `https://torappu.prts.wiki/assets/char_spine/char_4123_ela/${base}${ext}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${ext} ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(path.join(dir, path.basename(base) + ext), buf);
  console.log('ok', ext, buf.length);
}
const p = 'build/app/js/spine38-index.js';
const old = fs.readFileSync(p, 'utf8');
const start = old.indexOf('{');
const end = old.lastIndexOf('}');
const parsed = JSON.parse(old.slice(start, end + 1));
parsed.ela = { base: 'assets/spine38/operators/ela/char_4123_ela', name: '艾拉' };
const rest = old.slice(0, start);
fs.writeFileSync(p, rest + JSON.stringify(parsed, null, 2) + ';\n');
console.log('ela default updated');
