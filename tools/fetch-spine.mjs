import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const ops = JSON.parse(await readFile('.cache/all-operators.json', 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function post(params, tries = 12) {
  for (let i = 0; i < tries; i++) {
    try {
      const body = new URLSearchParams(params);
      const res = await fetch('https://prts.wiki/api.php', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'RhodesIslandIdle/2.0' }, body });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(500 + 400 * i);
    }
  }
}
async function queryPages(titles) {
  const map = new Map();
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const j = await post({ action: 'query', format: 'json', prop: 'revisions', rvslots: 'main', rvprop: 'content', titles: batch.join('|') });
    for (const p of Object.values(j.query?.pages || {})) {
      const text = p.revisions?.[0]?.slots?.main?.['*'];
      if (text) map.set(p.title.replace(/_/g, ' '), text);
    }
    console.log('spine pages', i, '/', titles.length);
    await sleep(50);
  }
  return map;
}
const titles = ops.map(o => o.name + '/spine');
const pages = await queryPages(titles);
const index = {};
for (const op of ops) {
  const text = pages.get(op.name + '/spine');
  if (!text) continue;
  try {
    const data = JSON.parse(text);
    const front = data?.skin?.['默认']?.['战斗正面']?.file;
    if (front) index[op.id] = { name: op.name, file: front, prefix: data.prefix || 'https://static.prts.wiki/spine/' };
  } catch (e) { console.error('parse', op.name, e.message); }
}
await writeFile('.cache/spine-index.json', JSON.stringify(index, null, 2));
console.log('spine indexed', Object.keys(index).length, '/', ops.length);

const root = path.resolve('build/app/assets/spine/operators');
await mkdir(root, { recursive: true });
let ok = 0, fail = 0;
const entries = Object.entries(index);
async function download(url, out, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const b = Buffer.from(await res.arrayBuffer());
      if (b.length < 50) throw new Error('small');
      await writeFile(out, b);
      return;
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(400 * (i + 1));
    }
  }
}
async function worker() {
  while (entries.length) {
    const [id, item] = entries.shift();
    const dir = path.join(root, id);
    await mkdir(dir, { recursive: true });
    const base = item.file.split('/').pop();
    try {
      for (const ext of ['.skel', '.atlas', '.png']) {
        const out = path.join(dir, base + ext);
        if (existsSync(out) && statSync(out).size > 40) continue;
        await download(`${item.prefix}${item.file}${ext}`, out);
      }
      ok++;
      if (ok % 20 === 0) console.log('spine downloaded', ok);
    } catch (e) {
      fail++;
      console.error('spine fail', id, e.message);
    }
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
console.log('spine done', ok, 'fail', fail);
