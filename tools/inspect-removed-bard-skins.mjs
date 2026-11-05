import { execFileSync } from 'node:child_process';
const ids = [
  'char_4045_heidi-skin1',
  'char_101_sora-skin1', 'char_101_sora-skin2',
  'char_4134_cetsyr-skin1',
  'char_4184_dolris-skin1',
  'char_4091_ulika-skin1',
  'skadi_alter-skin1', 'skadi_alter-skin2',
];
for (const rev of ['7ba65f0']) {
  const skinsText = execFileSync('git', ['show', `${rev}:build/app/js/skins.js`], { encoding: 'utf8' });
  const start = skinsText.indexOf('[');
  const end = skinsText.indexOf('\n];', start) + 2;
  const skins = JSON.parse(skinsText.slice(start, end));
  const remoteText = execFileSync('git', ['show', `ab805d0^:build/app/js/skin-spine-remote.js`], { encoding: 'utf8' });
  const remote = JSON.parse(remoteText.slice(remoteText.indexOf('{'), remoteText.lastIndexOf('}') + 1));
  for (const id of ids) console.log(JSON.stringify({ skin: skins.find(s => s.id === id), map: remote[id] }));
}
