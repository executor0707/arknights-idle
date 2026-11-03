import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
const extra = JSON.parse(await readFile('.cache/spine-extra2.json', 'utf8'));
const list = extra.filter(x => x.kind === '38').map(x => ({ id: x.id, base: x.base }));
list.push({ id: 'ling', base: 'https://torappu.prts.wiki/assets/char_spine/char_2023_ling/defaultskin/front/char_2023_ling' });
const root = path.resolve('build/app/assets/spine38/operators');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ok = 0, fail = 0;
for (const { id, base } of list) {
  const dir = path.join(root, id);
  await mkdir(dir, { recursive: true });
  const prefix = base.split('/').pop();
  let good = true;
  for (const ext of ['.skel', '.atlas', '.png']) {
    const out = path.join(dir, prefix + ext);
    if (existsSync(out) && statSync(out).size > 60) continue;
    let done = false;
    for (let i = 0; i < 6 && !done; i++) {
      try {
        const r = await fetch(base + ext, { signal: AbortSignal.timeout(25000), headers: { 'user-agent': 'Mozilla/5.0' } });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const b = Buffer.from(await r.arrayBuffer());
        if (b.length < 50) throw new Error('small');
        await writeFile(out, b); done = true;
      } catch (e) { await sleep(500 * (i + 1)); }
    }
    if (!done) { good = false; console.log('fail', id + ext); break; }
  }
  if (good) { ok++; console.log('ok', id); } else fail++;
}
console.log('done', ok, 'fail', fail);
