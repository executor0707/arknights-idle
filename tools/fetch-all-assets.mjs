import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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
async function getJSON(url, tries = 20) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(1200 + 700 * i);
    }
  }
}
const norm = s => s.replace(/_/g, ' ');
async function resolveFiles(files) {
  const map = new Map();
  for (let i = 0; i < files.length; i += 25) {
    const batch = files.slice(i, i + 25);
    const titles = batch.map(f => 'File:' + f).join('|');
    const j = await getJSON('https://prts.wiki/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size&titles=' + encodeURIComponent(titles));
    for (const p of Object.values(j.query?.pages || {})) {
      if (p.imageinfo?.[0]?.url) map.set(norm(p.title.replace(/^(File|文件):/, '')), p.imageinfo[0]);
    }
    await sleep(90);
  }
  return map;
}
async function download(url, out, tries = 3) {
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
      await sleep(900 * (i + 1));
    }
  }
}

// Base portraits
const opFiles = ops.map(o => ({ ...o, file: `半身像_${o.name}_1.png`, out: path.join(opDir, o.id + '.png') }));
const opResolve = await resolveFiles(opFiles.map(x => x.file));
let opOk = 0, opSkip = 0, opFail = 0;
for (const o of opFiles) {
  if (existsSync(o.out) && (await import('node:fs')).statSync(o.out).size > 1000) { opOk++; continue; }
  const old = path.join(oldPortraits, o.id + '.png');
  if (existsSync(old)) { await copyFile(old, o.out); opOk++; continue; }
  const info = opResolve.get(norm(o.file));
  if (!info) { opSkip++; console.log('MISS portrait', o.name, o.file); continue; }
  try { await download(info.url, o.out); opOk++; } catch (e) { opFail++; console.error('FAIL portrait', o.name, e.message); }
  await sleep(35);
}
console.log('portraits', { opOk, opSkip, opFail });

// Skin portraits
const skinFiles = skins.map(s => {
  const op = ops.find(o => o.id === s.opId);
  return { ...s, file: `半身像_${op?.name || ''}_${s.key}.png`, out: path.join(skinDir, s.id + '.png') };
});
const skinResolve = await resolveFiles(skinFiles.map(x => x.file));
let sOk = 0, sSkip = 0, sFail = 0;
for (const s of skinFiles) {
  if (existsSync(s.out) && (await import('node:fs')).statSync(s.out).size > 1000) { sOk++; continue; }
  const old = path.join(oldSkins, s.id + '.png');
  if (existsSync(old)) { await copyFile(old, s.out); sOk++; continue; }
  const info = skinResolve.get(norm(s.file));
  if (!info) { sSkip++; console.log('MISS skin', s.id, s.file); continue; }
  try { await download(info.url, s.out); sOk++; } catch (e) { sFail++; console.error('FAIL skin', s.id, e.message); }
  await sleep(30);
}
console.log('skins', { sOk, sSkip, sFail });
await writeFile('.cache/asset-report.json', JSON.stringify({ opOk, opSkip, opFail, sOk, sSkip, sFail }, null, 2));

