import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
const { found } = JSON.parse(await readFile('.cache/spine38-all.json', 'utf8'));
const root = path.resolve('build/app/assets/spine38/operators');
await mkdir(root, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let cursor = 0, ok = 0, fail = 0;
const failures = [];
async function one(entry) {
  const { id, base } = entry;
  const dir = path.join(root, id);
  await mkdir(dir, { recursive: true });
  const prefix = base.split('/').pop();
  let all = true;
  for (const ext of ['.skel', '.atlas', '.png']) {
    const out = path.join(dir, prefix + ext);
    if (existsSync(out) && statSync(out).size > 60) continue;
    let done = false;
    for (let i = 0; i < 6 && !done; i++) {
      try {
        const r = await fetch(base + ext, { signal: AbortSignal.timeout(25000), headers: { 'user-agent': 'Mozilla/5.0' } });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const b = Buffer.from(await r.arrayBuffer());
        if (b.length < 50) throw new Error('small');
        await writeFile(out, b);
        done = true;
      } catch (e) { await sleep(600 * (i + 1)); }
    }
    if (!done) { all = false; failures.push(id + ext); break; }
  }
  if (all) { ok++; if (ok % 20 === 0) console.log('downloaded', ok); }
  else fail++;
}
async function worker() { while (cursor < found.length) await one(found[cursor++]); }
await Promise.all(Array.from({ length: 8 }, worker));
console.log('done', ok, 'fail', fail);
await writeFile('.cache/spine38-download-fail.json', JSON.stringify(failures, null, 2));
