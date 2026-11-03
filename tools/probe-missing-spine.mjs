import { readFile, writeFile } from 'node:fs/promises';
const ops = JSON.parse(await readFile('.cache/all-operators.json', 'utf8'));
const idx = JSON.parse(await readFile('.cache/spine-index.json', 'utf8'));
const missing = ops.filter(o => !idx[o.id]);
const found = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function test(o) {
  const id = o.id;
  if (!/^char_/.test(id)) return;
  const base = `https://static.prts.wiki/spine/char/${id}/${id}/${id}`;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(base + '.skel', { method: 'HEAD', headers: { 'user-agent': 'Mozilla/5.0' } });
      if (r.ok) { found.push({ id, name: o.name, file: `char/${id}/${id}/${id}` }); console.log('found', o.name, id); }
      return;
    } catch (e) { await sleep(500); }
  }
}
let cursor = 0;
async function worker() {
  while (cursor < missing.length) await test(missing[cursor++]);
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log('direct found', found.length, '/', missing.length);
await writeFile('.cache/spine-direct-found.json', JSON.stringify(found, null, 2));
