import { SKINS } from '../build/app/js/skins.js';
import { SKIN_SPINE } from '../build/app/js/skin-spine-index.js';
import { SKIN_SPINE_REMOTE } from '../build/app/js/skin-spine-remote.js';
import { SPINE38_OPERATORS, SPINE35_ONLY } from '../build/app/js/spine38-index.js';

const rows = SKINS.map(s => {
  const local = SKIN_SPINE[s.id];
  const remote = SKIN_SPINE_REMOTE[s.id];
  const entry = local || remote;
  const base = entry?.base || null;
  const defaultBase = SPINE38_OPERATORS[s.opId]?.base || SPINE35_ONLY[s.opId]?.base || null;
  return { id: s.id, op: s.opId, name: s.name, key: s.key, base, defaultBase, local: !!local, remote: !!remote };
});
const suspicious = rows.filter(r => !r.base || !r.defaultBase || r.base === r.defaultBase || /defaultskin/i.test(r.base));
const byBase = new Map();
for (const r of rows) if (r.base) (byBase.get(r.base) || byBase.set(r.base, []).get(r.base)).push(r);
const duplicates = [...byBase.entries()].filter(([, a]) => a.length > 1).map(([base, a]) => ({ base, skins: a.map(x => x.id) }));
console.log(JSON.stringify({
  total: rows.length,
  mapped: rows.filter(r => r.base).length,
  suspicious,
  duplicateBases: duplicates,
}, null, 2));
