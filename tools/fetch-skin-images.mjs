import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const skins = JSON.parse(await readFile('.cache/skins.json', 'utf8'));
const cacheDir = path.resolve('.cache/skins');
await mkdir(cacheDir, { recursive: true });

async function getJSON(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'RhodesIslandIdle/1.0' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}
let failed = 0, done = 0;
for (const op of skins) {
  for (const s of op.skins) {
    const out = path.join(cacheDir, `${op.id}-${s.key}.png`);
    if (existsSync(out)) { done++; continue; }
    const file = `半身像_${op.name}_${s.key}.png`;
    try {
      const meta = await getJSON('https://prts.wiki/api.php?action=query&format=json&titles=' + encodeURIComponent('文件:' + file) + '&prop=imageinfo&iiprop=url|size');
      const page = Object.values(meta.query?.pages || {})[0];
      const info = page?.imageinfo?.[0];
      if (!info?.url) throw new Error('no image');
      const res = await fetch(info.url, { headers: { 'user-agent': 'RhodesIslandIdle/1.0' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(out, buf);
      done++;
      console.log(op.name, s.key, s.name, buf.length);
    } catch (e) {
      failed++;
      console.error('FAIL', op.name, s.key, e.message);
    }
    await sleep(55);
  }
}
console.log('done', done, 'failed', failed);
