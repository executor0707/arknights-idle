import { SKINS } from '../build/app/js/skins.js';
import { SKIN_SPINE } from '../build/app/js/skin-spine-index.js';
import { SKIN_SPINE_REMOTE } from '../build/app/js/skin-spine-remote.js';
const rows = [];
for (const s of SKINS) {
  const e = SKIN_SPINE[s.id] || SKIN_SPINE_REMOTE[s.id];
  if (!e) continue;
  if (e.name !== s.name) rows.push({ id: s.id, op: s.opId, skinName: s.name, mapName: e.name, base: e.base });
}
console.log(JSON.stringify(rows, null, 2));
