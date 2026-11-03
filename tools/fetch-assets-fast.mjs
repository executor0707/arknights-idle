import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const ops = JSON.parse(await readFile('.cache/all-operators.json', 'utf8'));
const skins = JSON.parse(await readFile('.cache/all-skins.json', 'utf8'));
const oldPortraits = path.resolve('.cache/portraits');
const oldSkins = path.resolve('.cache/skins');
const opDir = path.resolve('.cache/portraits-v2');
const skinDir = path.resolve('.cache/skins-v2');
await mkdir(opDir, { recursive: true });
await mkdir(skinDir, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = s => s.replace(/_/g, ' ');

async function postQuery(titles, tries = 10) {
  for (let i = 0; i < tries; i++) {
    try {
      const body = new URLSearchParams({ action: 'query', format: 'json', prop: 'imageinfo', iiprop: 'url|size', titles: titles.join('|') });
      const res = await fetch('https://prts.wiki/api.php', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'RhodesIslandIdle/2.0' }, body });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(500 + 500 * i);
    }
  }
}
async function resolve(files) {
  const map = new Map();
  for (let i = 0; i < files.length; i += 40) {
    const batch = files.slice(i, i + 40).map(f => 'File:' + f);
    let j;
    for (let attempt = 0; attempt < 6; attempt++) {
      try { j = await postQuery(batch); break; } catch (e) { if (attempt === 5) throw e; await sleep(1000); }
    }
    for (const p of Object.values(j.query?.pages || {})) {
      if (p.imageinfo?.[0]?.url) map.set(norm(p.title.replace(/^(File|文件):/, '')), p.imageinfo[0]);
    }
    console.log('resolve', i, '/', files.length);
    await sleep(60);
  }
  return map;
}
async function download(url, out, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const b = Buffer.from(await r.arrayBuffer());
      if (b.length < 1000) throw new Error('small');
      await writeFile(out, b);
      return b.length;
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(500 * (i + 1));
    }
  }
}
async function pool(items, worker, n = 6) {
  let idx = 0;
  async function run() {
    while (idx < items.length) {
      const item = items[idx++];
      try { await worker(item); } catch (e) { console.error('FAIL', item.name || item.id, e.message); }
    }
  }
  await Promise.all(Array.from({ length: n }, run));
}

const opFiles = ops.map(o => ({ ...o, file: `半身像_${o.name}_1.png`, out: path.join(opDir, o.id + '.png') }));
const opResolve = await resolve(opFiles.map(x => x.file));
await pool(opFiles, async (o) => {
  if (existsSync(o.out) && statSync(o.out).size > 1000) return;
  const old = path.join(oldPortraits, o.id + '.png');
  if (existsSync(old)) { await copyFile(old, o.out); return; }
  const info = opResolve.get(norm(o.file));
  if (!info) { console.log('MISS portrait', o.name); return; }
  await download(info.url, o.out);
  console.log('portrait', o.name);
}, 6);

const skinFiles = skins.map(s => {
  const op = ops.find(o => o.id === s.opId);
  return { ...s, name: `${op?.name || ''} · ${s.name}`, file: `半身像_${op?.name || ''}_${s.key}.png`, out: path.join(skinDir, s.id + '.png') };
});
const skinResolve = await resolve(skinFiles.map(x => x.file));
await pool(skinFiles, async (s) => {
  if (existsSync(s.out) && statSync(s.out).size > 1000) return;
  const old = path.join(oldSkins, s.id + '.png');
  if (existsSync(old)) { await copyFile(old, s.out); return; }
  const info = skinResolve.get(norm(s.file));
  if (!info) { console.log('MISS skin', s.id); return; }
  await download(info.url, s.out);
  console.log('skin', s.id);
}, 6);

const opCount = (await import('node:fs/promises')).readdir(opDir).then(a => a.filter(x => x.endsWith('.png')).length);
const skinCount = (await import('node:fs/promises')).readdir(skinDir).then(a => a.filter(x => x.endsWith('.png')).length);
console.log('DONE portraits', await opCount, '/', ops.length, 'skins', await skinCount, '/', skins.length);
