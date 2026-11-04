import { OPERATORS } from '../build/app/js/operators.js';
for (const id of ['amiya', 'char_391_rosmon', 'char_4065_judge', 'nian', 'char_136_hsguma']) {
  const o = OPERATORS.find(x => x.id === id);
  console.log(JSON.stringify({ id, name: o?.name, cls: o?.cls, sub: o?.sub, skill: o?.skill }, null, 2));
}
console.log('skill types', [...new Set(OPERATORS.map(o => o.skill?.type))]);
console.log('missing desc', OPERATORS.filter(o => !o.skill?.desc).length, 'of', OPERATORS.length);
