import { readFile, writeFile } from 'node:fs/promises';
const ops = JSON.parse(await readFile('.cache/all-operators.json', 'utf8'));
const sin = JSON.parse(await readFile('.cache/spine-index.json', 'utf8'));
const src = await readFile('.cache/ak-sd/charData.js', 'utf8');
const charData = new Function('charData', src + '; return charData;')({});
const manual = {
  ela: 'char_4124_iana', // temporary; corrected below if probe fails
};
function charId(op) {
  if (/^char_/.test(op.id)) return op.id;
  if (sin[op.id]?.file) return sin[op.id].file.split('/').pop();
  if (charData[op.id]?.skin?.[0]) return charData[op.id].skin[0];
  if (manual[op.id]) return manual[op.id];
  return null;
}
const found = [], missing = [];
const queue = ops.map(o => ({ o, cid: charId(o) }));
let cursor = 0;
async function worker() {
  while (cursor < queue.length) {
    const { o, cid } = queue[cursor++];
    if (!cid) { missing.push({ id: o.id, name: o.name, reason: 'no-id' }); continue; }
    const base = `https://torappu.prts.wiki/assets/char_spine/${cid}/defaultskin/front/${cid}`;
    let ok = false;
    for (let i = 0; i < 4 && !ok; i++) {
      try {
        const r = await fetch(base + '.skel', { method: 'HEAD', signal: AbortSignal.timeout(12000), headers: { 'user-agent': 'Mozilla/5.0' } });
        if (r.ok) ok = true;
        else if (r.status === 404) break;
      } catch { await new Promise(r => setTimeout(r, 400)); }
    }
    if (ok) found.push({ id: o.id, name: o.name, charId: cid, base });
    else missing.push({ id: o.id, name: o.name, charId: cid, reason: 'http' });
  }
}
await Promise.all(Array.from({ length: 10 }, worker));
console.log('found', found.length, 'missing', missing.length);
console.log(missing.slice(0, 40).map(x => x.id + '/' + (x.charId || x.reason)).join(' '));
await writeFile('.cache/spine38-all.json', JSON.stringify({ found, missing }, null, 2));
