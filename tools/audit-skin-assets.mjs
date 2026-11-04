import fs from 'node:fs';
import path from 'node:path';
import { SKINS } from '../build/app/js/skins.js';
import { SKIN_SPINE } from '../build/app/js/skin-spine-index.js';
import { SKIN_SPINE_REMOTE } from '../build/app/js/skin-spine-remote.js';
const rows = SKINS.map(s => ({ id: s.id, op: s.opId, name: s.name, local: SKIN_SPINE[s.id], remote: SKIN_SPINE_REMOTE[s.id] }));
const missingMap = rows.filter(r => !r.local && !r.remote);
const jobs = [];
for (const r of rows) {
  if (r.local) {
    for (const ext of ['.atlas', '.skel', '.png']) {
      const p = path.join('build/app', r.local.base + ext);
      if (!fs.existsSync(p)) jobs.push({ id: r.id, op: r.op, name: r.name, kind: 'local', file: p, error: 'missing' });
    }
  } else if (r.remote) {
    for (const ext of ['.atlas', '.skel', '.png']) jobs.push({ id: r.id, op: r.op, name: r.name, kind: 'remote', url: r.remote.base + ext });
  }
}
const failures = [];
let cursor = 0;
async function worker() {
  while (cursor < jobs.length) {
    const j = jobs[cursor++];
    try {
      if (j.kind === 'local') { failures.push(j); continue; }
      const r = await fetch(j.url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      if (!r.ok) failures.push({ ...j, status: r.status });
    } catch (e) { failures.push({ ...j, error: String(e.message || e) }); }
  }
}
await Promise.all(Array.from({ length: 16 }, worker));
const bySkin = new Map();
for (const f of failures) {
  if (!bySkin.has(f.id)) bySkin.set(f.id, []);
  bySkin.get(f.id).push(f);
}
console.log(JSON.stringify({
  total: rows.length,
  mapped: rows.length - missingMap.length,
  missingMap: missingMap.map(r => `${r.id}|${r.op}|${r.name}`),
  assetFailureSkins: bySkin.size,
  failures: [...bySkin.entries()].map(([id, fs]) => ({ id, files: fs.map(f => f.status ? f.status + ' ' + f.url : f.error + ' ' + (f.url || f.file)) })),
}, null, 2));
