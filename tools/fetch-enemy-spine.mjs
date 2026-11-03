import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const map = {
  soldier: '士兵', slime: '源石虫', shield: '盾卫', caster: '术师', hound: '猎狗', mob: '暴徒',
  boss_skulsr: '碎骨', boss_frstar: '霜星', boss_faust: '浮士德', boss_mephi: '梅菲斯特',
};
const outRoot = path.resolve('build/app/assets/spine/enemies');
await mkdir(outRoot, { recursive: true });
const index = {};
for (const [key, page] of Object.entries(map)) {
  try {
    const u = 'https://prts.wiki/api.php?action=parse&format=json&page=' + encodeURIComponent(page + '/spine') + '&prop=wikitext';
    const j = await (await fetch(u, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' } })).json();
    const text = j.parse?.wikitext?.['*'] || '';
    const data = JSON.parse(text);
    const file = data?.skin?.['默认']?.['战斗正面']?.file || data?.skin?.['默认']?.['战斗']?.file || Object.values(data?.skin?.['默认'] || {})?.[0]?.file;
    if (!file) { console.log('no file', key); continue; }
    const base = file.split('/').pop();
    const dir = path.join(outRoot, key);
    await mkdir(dir, { recursive: true });
    for (const ext of ['.skel', '.atlas', '.png']) {
      const out = path.join(dir, base + ext);
      if (existsSync(out) && statSync(out).size > 40) continue;
      for (let i = 0; i < 6; i++) {
        try {
          const r = await fetch(`${data.prefix}${file}${ext}`, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' } });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const b = Buffer.from(await r.arrayBuffer());
          if (b.length < 50) throw new Error('small');
          await writeFile(out, b);
          break;
        } catch (e) {
          if (i === 5) throw e;
          await sleep(600 * (i + 1));
        }
      }
    }
    index[key] = { page, base: `assets/spine/enemies/${key}/${base}` };
    console.log('ok', key, page);
  } catch (e) { console.error('fail', key, page, e.message); }
}
await writeFile('.cache/enemy-spine-index.json', JSON.stringify(index, null, 2));
console.log('enemy index', Object.keys(index).length);
