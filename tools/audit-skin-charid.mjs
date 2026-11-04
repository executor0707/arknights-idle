import { SKINS } from '../build/app/js/skins.js';
import { SKIN_SPINE } from '../build/app/js/skin-spine-index.js';
import { SKIN_SPINE_REMOTE } from '../build/app/js/skin-spine-remote.js';
import { SPINE38_OPERATORS, SPINE35_ONLY } from '../build/app/js/spine38-index.js';
const charId = s => (String(s || '').match(/char_[0-9]+_[a-zA-Z0-9]+/) || [])[0] || '';
const rows = SKINS.map(s => {
  const entry = SKIN_SPINE[s.id] || SKIN_SPINE_REMOTE[s.id];
  const base = entry?.base || '';
  const def = SPINE38_OPERATORS[s.opId]?.base || SPINE35_ONLY[s.opId]?.base || '';
  return { id: s.id, op: s.opId, name: s.name, baseChar: charId(base), defaultChar: charId(def), base, def };
}).filter(r => r.base && r.defaultChar && r.baseChar !== r.defaultChar);
console.log(JSON.stringify(rows, null, 2));
