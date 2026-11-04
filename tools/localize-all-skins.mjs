import fs from 'node:fs';
import path from 'node:path';
import { SKINS } from '../build/app/js/skins.js';
import { SKIN_SPINE } from '../build/app/js/skin-spine-index.js';
import { SKIN_SPINE_REMOTE } from '../build/app/js/skin-spine-remote.js';

const local = { ...SKIN_SPINE };
const remote = { ...SKIN_SPINE_REMOTE };
const jobs = [];
for (const s of SKINS) {
  if (local[s.id] || !remote[s.id]) continue;
  jobs.push({ s, base: remote[s.id].base, name: remote[s.id].name });
}
let cursor = 0, done = 0;
const failures = [];
async function fetchOne(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error(String(r.status));
      return Buffer.from(await r.arrayBuffer());
    } catch (e) {
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  return null;
}
async function worker() {
  while (cursor < jobs.length) {
    const j = jobs[cursor++];
    const dir = path.join('build/app/assets/spine38/skins', j.s.id);
    fs.mkdirSync(dir, { recursive: true });
    const baseName = path.basename(j.base);
    let ok = true;
    for (const ext of ['.skel', '.atlas', '.png']) {
      const target = path.join(dir, baseName + ext);
      if (fs.existsSync(target) && fs.statSync(target).size > 0) continue;
      const buf = await fetchOne(j.base + ext);
      if (!buf) { ok = false; failures.push(j.s.id + ext); continue; }
      fs.writeFileSync(target, buf);
    }
    if (ok) {
      local[j.s.id] = { name: j.name, base: `assets/spine38/skins/${j.s.id}/${baseName}` };
      delete remote[j.s.id];
    }
    done++;
    if (done % 25 === 0) console.log('progress', done + '/' + jobs.length, 'failures', failures.length);
  }
}
await Promise.all(Array.from({ length: 12 }, worker));
fs.writeFileSync('build/app/js/skin-spine-index.js',
  '// All battle-front skins are bundled locally for offline/GitHub-only access.\nexport const SKIN_SPINE = ' + JSON.stringify(local, null, 2) + ';\n');
fs.writeFileSync('build/app/js/skin-spine-remote.js',
  '// No remote skins remain; everything is bundled under assets/spine38/skins.\nexport const SKIN_SPINE_REMOTE = ' + JSON.stringify(remote, null, 2) + ';\n');
console.log(JSON.stringify({ bundled: Object.keys(local).length, downloads: jobs.length, failures, remainingRemote: Object.keys(remote).length }, null, 2));
