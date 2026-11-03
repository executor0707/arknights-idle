import { readFile, writeFile } from 'node:fs/promises';
const a = JSON.parse(await readFile('.cache/spine38-all.json', 'utf8'));
const s = JSON.parse(await readFile('.cache/spine-index.json', 'utf8'));
const miss = a.missing.map(x => x.id).filter(id => !s[id] && !a.found.some(f => f.id === id));
const out = [];
for (const id of miss) {
  if (!/^char_/.test(id)) continue;
  for (const kind of ['38', '35']) {
    const url = kind === '38'
      ? `https://torappu.prts.wiki/assets/char_spine/${id}/defaultskin/front/${id}.skel`
      : `https://static.prts.wiki/spine/char/${id}/${id}/${id}.skel`;
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0' } });
      if (r.ok) { out.push({ id, kind, base: url.replace(/\.skel$/, '') }); console.log('found', kind, id); break; }
    } catch (e) { /* retry once */ }
  }
}
console.log('extra', out.length, '/', miss.length);
await writeFile('.cache/spine-extra2.json', JSON.stringify(out, null, 2));
