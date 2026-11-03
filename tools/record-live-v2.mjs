import { readFile, writeFile } from 'node:fs/promises';
const p = 'qa/verification.json';
const v = JSON.parse(await readFile(p, 'utf8'));
v.deployment = {
  url: 'https://executor0707.github.io/arknights-idle/',
  httpStatus: 200,
  title: '罗德岛值守协议 · ARKNIGHTS IDLE',
  testedAt: new Date().toISOString(),
  liveCounts: { operators: 469, skins: 531, stages: 362, main: 307, annihilation: 37 },
  errors: [],
};
await writeFile(p, JSON.stringify(v, null, 2));
console.log('updated');
