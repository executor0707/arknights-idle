import { readFile, writeFile } from 'node:fs/promises';
const a = JSON.parse(await readFile('.cache/spine38-all.json', 'utf8'));
const s = JSON.parse(await readFile('.cache/spine-index.json', 'utf8'));
const miss = a.missing.map(x => x.id).filter(id => !s[id]);
const out = [];
for (const id of miss) {
  if (!/^char_/.test(id)) continue;
  for (const [kind, url] of [
    ['35', `https://static.prts.wiki/spine/char/${id}/${id}/${id}.skel`],
    ['38', `https://torappu.prts.wiki/assets/char_spine/${id}/defaultskin/front/${id}.skel`],
  ]) {
    try {
      const r = await fetch(url, { method: 'HEAD', headers: { 'user-agent': 'Mozilla/5.0' } });
      if (r.ok) { out.push({ id, kind, url: url.replace(/\.skel$/, '') }); console.log('found', kind, id); }
    } catch (e) {}
  }
}
console.log('direct', out.length, '/', miss.length);
await writeFile('.cache/spine-direct-extra.json', JSON.stringify(out, null, 2));
