import fs from 'node:fs';
import { OPERATORS } from '../build/app/js/operators.js';
import { SKINS } from '../build/app/js/skins.js';

const byId = new Map(OPERATORS.map(o => [o.id, o]));
const opIds = [...new Set(SKINS.map(s => s.opId))];
const pages = opIds.map(id => (byId.get(id)?.name || '') + '/spine').filter(x => !x.startsWith('/spine'));
const map = {};
let missingPages = 0;
for (let i = 0; i < pages.length; i += 40) {
  const batch = pages.slice(i, i + 40);
  const url = 'https://prts.wiki/api.php?action=query&format=json&formatversion=2&prop=revisions&rvprop=content&rvslots=main&redirects=1&titles=' + encodeURIComponent(batch.join('|'));
  let j = null;
  for (let k = 0; k < 4 && !j; k++) {
    try { j = await (await fetch(url, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' }, signal: AbortSignal.timeout(45000) })).json(); }
    catch (e) { await new Promise(r => setTimeout(r, 900)); }
  }
  if (!j) { console.log('batch failed', i); continue; }
  for (const p of j.query?.pages || []) {
    if (!p.revisions?.[0]?.slots?.main?.content) { missingPages++; continue; }
    let data;
    try { data = JSON.parse(p.revisions[0].slots.main.content); } catch { missingPages++; continue; }
    const opName = data.name || p.title.replace(/\/spine$/, '');
    const op = OPERATORS.find(o => o.name === opName);
    if (!op) continue;
    const prefix = data.prefix || 'https://static.prts.wiki/spine/';
    for (const [skinName, parts] of Object.entries(data.skin || {})) {
      if (skinName === '默认') continue;
      const file = parts?.['战斗正面']?.file;
      if (!file) continue;
      const skin = SKINS.find(s => s.opId === op.id && s.name === skinName);
      if (skin) map[skin.id] = { name: skinName, base: prefix + file };
    }
  }
  console.log('batch', i, 'mapped', Object.keys(map).length);
}
fs.writeFileSync('.cache/skin-spine-map.json', JSON.stringify(map, null, 2));
fs.writeFileSync('build/app/js/skin-spine-index.js', '// Generated from PRTS /spine pages; equipped skin -> battle-front Spine.\nexport const SKIN_SPINE = ' + JSON.stringify(map, null, 2) + ';\n');
console.log('skins', SKINS.length, 'mapped', Object.keys(map).length, 'missingPages', missingPages);
