import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { OPERATORS } from './operators.mjs';

const root = path.resolve('.');
const cacheDir = path.join(root, '.cache', 'portraits');
await mkdir(cacheDir, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const api = 'https://prts.wiki/api.php';

async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'RhodesIslandIdle/1.0 (fan project)' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(600 * (i + 1));
    }
  }
}

async function download(op) {
  const out = path.join(cacheDir, op.id + '.png');
  if (existsSync(out)) return { id: op.id, status: 'cached' };
  const file = `半身像_${op.name}_1.png`;
  const meta = await getJSON(`${api}?action=query&format=json&titles=${encodeURIComponent('文件:' + file)}&prop=imageinfo&iiprop=url|size`);
  const page = Object.values(meta.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.url) throw new Error('No image for ' + op.name);
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(info.url, { headers: { 'user-agent': 'RhodesIslandIdle/1.0' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error('Suspiciously small file');
      await writeFile(out, buf);
      return { id: op.id, name: op.name, file, bytes: buf.length, source: info.descriptionurl };
    } catch (e) {
      if (i === 2) throw e;
      await sleep(800 * (i + 1));
    }
  }
}

const queue = [...OPERATORS];
const results = [];
let failed = 0;
async function worker(wid) {
  while (queue.length) {
    const op = queue.shift();
    try {
      const r = await download(op);
      results.push({ ...r, name: op.name });
      console.log(`[${wid}] ${op.name} ${r.status || 'ok'}`);
    } catch (e) {
      failed++;
      console.error(`[${wid}] FAIL ${op.name}: ${e.message}`);
    }
    await sleep(60);
  }
}
await Promise.all([0, 1, 2, 3].map(worker));
results.sort((a, b) => OPERATORS.findIndex(o => o.id === a.id) - OPERATORS.findIndex(o => o.id === b.id));
await writeFile(path.join(cacheDir, 'credits.json'), JSON.stringify({
  source: 'https://prts.wiki/',
  note: '干员半身像来自 PRTS Wiki，版权归上海鹰角网络科技有限公司所有。本作仅作非商业同人展示。',
  files: results,
}, null, 2));
console.log(`Done. ${results.length}/${OPERATORS.length}, failed=${failed}, cache=${cacheDir}`);
