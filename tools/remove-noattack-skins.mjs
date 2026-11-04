import fs from 'node:fs';
import { SKINS } from '../build/app/js/skins.js';
import { SKIN_SPINE } from '../build/app/js/skin-spine-index.js';
import { SKIN_SPINE_REMOTE } from '../build/app/js/skin-spine-remote.js';

// 21 skins with no native attack clip + 2 skins with no usable battle Spine.
const removeIds = new Set([
  'char_388_mint-skin1', 'char_388_mint-skin2',
  'char_445_wscoot-skin1',
  'char_4045_heidi-skin1',
  'char_426_billro-skin1', 'char_426_billro-skin2',
  'char_101_sora-skin1', 'char_101_sora-skin2',
  'char_486_takila-skin1', 'char_486_takila-skin2',
  'mlynar-skin1', 'mlynar-skin2',
  'char_344_beewax-skin1', 'char_344_beewax-skin2',
  'char_4134_cetsyr-skin1',
  'char_4184_dolris-skin1',
  'char_1043_leizi2-skin1',
  'char_376_therex-skin1',
  'char_4091_ulika-skin1',
  'skadi_alter-skin1', 'skadi_alter-skin2',
  'liskarm-skin1', 'liskarm-skin2',
]);
const skins = SKINS.filter(s => !removeIds.has(s.id));
const byId = new Map(skins.map(s => [s.id, s]));
const byOp = {};
for (const s of skins) (byOp[s.opId] ||= []).push(s);
fs.writeFileSync('build/app/js/skins.js',
  `// Generated skins. ${skins.length} skins with native attack + usable battle Spine.\nexport const SKINS = ${JSON.stringify(skins, null, 2)};\nexport const SKIN_BY_ID = new Map(SKINS.map(s => [s.id, s]));\nexport const SKINS_BY_OP = ${JSON.stringify(byOp, null, 2)};\n`);

const local = Object.fromEntries(Object.entries(SKIN_SPINE).filter(([id]) => !removeIds.has(id)));
const remote = Object.fromEntries(Object.entries(SKIN_SPINE_REMOTE).filter(([id]) => !removeIds.has(id)));
fs.writeFileSync('build/app/js/skin-spine-index.js',
  '// Skin battle-front Spine from PRTS torappu char_spine meta.\nexport const SKIN_SPINE = ' + JSON.stringify(local, null, 2) + ';\n');
fs.writeFileSync('build/app/js/skin-spine-remote.js',
  '// Remote PRTS battle-front skin Spine. Local files (SKIN_SPINE) override this map.\nexport const SKIN_SPINE_REMOTE = ' + JSON.stringify(remote, null, 2) + ';\n');

console.log(JSON.stringify({ removed: [...removeIds], skins: skins.length, local: Object.keys(local).length, remote: Object.keys(remote).length }, null, 2));
