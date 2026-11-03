import { OPERATORS } from './operators.mjs';
import { mkdir, writeFile } from 'node:fs/promises';

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'RhodesIslandIdle/1.0 (fan project)' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(1200 * (i + 1));
    }
  }
}
const out = [];
for (const op of OPERATORS) {
  const j = await getJSON('https://prts.wiki/api.php?action=parse&format=json&page=' + encodeURIComponent(op.name) + '&prop=wikitext');
  const t = j.parse?.wikitext?.['*'] || '';
  const skins = [];
  for (let i = 1; i <= 20; i++) {
    const name = t.match(new RegExp(`\\|时装${i}名称=([^\\n\\r]*)`))?.[1]?.trim();
    if (!name) continue;
    const series = t.match(new RegExp(`\\|时装${i}系列=([^\\n\\r]*)`))?.[1]?.trim() || '';
    const color = t.match(new RegExp(`\\|时装${i}颜色=([^\\n\\r]*)`))?.[1]?.trim() || '#888888';
    const desc = t.match(new RegExp(`\\|时装${i}介绍=([^\\n\\r]*)`))?.[1]?.trim() || '';
    skins.push({ key: 'skin' + i, name, series, color, desc });
  }
  out.push({ id: op.id, name: op.name, skins });
  console.log(op.name, skins.length, skins.map(s => s.name).join(' / '));
  await sleep(120);
}
await mkdir('.cache', { recursive: true });
await writeFile('.cache/skins.json', JSON.stringify(out, null, 2));
console.log('TOTAL', out.reduce((s, o) => s + o.skins.length, 0));
