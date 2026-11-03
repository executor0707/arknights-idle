import { readFile, writeFile } from 'node:fs/promises';
const ops = JSON.parse(await readFile('.cache/all-operators.json', 'utf8'));
const sin = JSON.parse(await readFile('.cache/spine-index.json', 'utf8'));
const charDataCode = await readFile('.cache/ak-sd/charData.js', 'utf8');
const charData = {};
new Function('charData', charDataCode + '; return charData;')(charData);

function charId(op) {
  if (/^char_/.test(op.id)) return op.id;
  const s = sin[op.id];
  if (s?.file) return s.file.split('/').pop();
  const c = charData[op.id];
  if (c?.skin?.[0]) return c.skin[0];
  const byName = Object.values(charData).find(x => x.name === op.name);
  if (byName?.skin?.[0]) return byName.skin[0];
  return null;
}
const found = [], missing = [];
let cursor = 0;
async function one(op) {
  const id = charId(op);
  if (!id) { missing.push(op.id); return; }
  const base = `https://torappu.prts.wiki/assets/char_spine/${id}/defaultskin/front/${id}`;
  try {
    const r = await fetch(base + '.skel', { method: 'HEAD', headers: { 'user-agent': 'Mozilla/5.0' } });
    if (r.ok) found.push({ id: op.id, name: op.name, charId: id, base }); else missing.push(op.id);
  } catch { missing.push(op.id); }
}
async function worker() { while (cursor < ops.length) await one(ops[cursor++]); }
await Promise.all(Array.from({ length: 8 }, worker));
console.log('found', found.length, 'missing', missing.length);
console.log('missing', missing.slice(0, 30).join(','));
await writeFile('.cache/spine38-operators.json', JSON.stringify(found, null, 2));
