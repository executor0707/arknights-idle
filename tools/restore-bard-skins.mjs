import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { SKINS } from '../build/app/js/skins.js';
import { SKIN_SPINE } from '../build/app/js/skin-spine-index.js';

const ids = [
  'char_4045_heidi-skin1',
  'char_101_sora-skin1', 'char_101_sora-skin2',
  'char_4134_cetsyr-skin1',
  'char_4184_dolris-skin1',
  'char_4091_ulika-skin1',
  'skadi_alter-skin1', 'skadi_alter-skin2',
];

const oldSkinsText = execFileSync('git', ['show', '7ba65f0:build/app/js/skins.js'], { encoding: 'utf8' });
const s = oldSkinsText.indexOf('[');
const e = oldSkinsText.indexOf('\n];', s) + 2;
const oldSkins = JSON.parse(oldSkinsText.slice(s, e));
const oldRemoteText = execFileSync('git', ['show', 'ab805d0^:build/app/js/skin-spine-remote.js'], { encoding: 'utf8' });
const oldRemote = JSON.parse(oldRemoteText.slice(oldRemoteText.indexOf('{'), oldRemoteText.lastIndexOf('}') + 1));

const restored = ids.map(id => oldSkins.find(x => x.id === id)).filter(Boolean);
if (restored.length !== ids.length) throw new Error('missing old skin data ' + (ids.length - restored.length));

const localMap = { ...SKIN_SPINE };
for (const skin of restored) {
  const entry = oldRemote[skin.id];
  if (!entry) throw new Error('missing old map ' + skin.id);
  const baseName = path.basename(entry.base);
  const dir = path.join('build/app/assets/spine38/skins', skin.id);
  fs.mkdirSync(dir, { recursive: true });
  for (const ext of ['.skel', '.atlas', '.png']) {
    const url = entry.base + ext;
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`${skin.id}${ext} ${r.status}`);
    fs.writeFileSync(path.join(dir, baseName + ext), Buffer.from(await r.arrayBuffer()));
  }
  localMap[skin.id] = { name: skin.name, base: `assets/spine38/skins/${skin.id}/${baseName}` };
  console.log('restored', skin.id, skin.name);
}

const merged = [...SKINS, ...restored.filter(x => !SKINS.some(y => y.id === x.id))];
const byOp = {};
for (const skin of merged) (byOp[skin.opId] ||= []).push(skin);
fs.writeFileSync('build/app/js/skins.js',
  `// Generated skins. ${merged.length} skins. Bard skins may have no attack animation.\nexport const SKINS = ${JSON.stringify(merged, null, 2)};\nexport const SKIN_BY_ID = new Map(SKINS.map(s => [s.id, s]));\nexport const SKINS_BY_OP = ${JSON.stringify(byOp, null, 2)};\n`);
fs.writeFileSync('build/app/js/skin-spine-index.js',
  `// All battle-front skins are bundled locally for offline/GitHub-only access.\nexport const SKIN_SPINE = ${JSON.stringify(localMap, null, 2)};\n`);

let game = fs.readFileSync('build/app/js/game.js', 'utf8');
for (const id of ids) {
  game = game.replace(new RegExp(`\\s*'${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',?`, 'g'), '');
}
fs.writeFileSync('build/app/js/game.js', game);
console.log(JSON.stringify({ skins: merged.length, localSpine: Object.keys(localMap).length, restored: restored.map(x => x.id) }, null, 2));
