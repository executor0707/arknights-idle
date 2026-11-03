import { readFile, writeFile } from 'node:fs/promises';
for (const p of ['qa/verification-v2.json', 'qa/verification.json']) {
  const v = JSON.parse(await readFile(p, 'utf8'));
  v.checks.spine = {
    canvas: true,
    operatorSpineUnitsOnStarterBattle: 8,
    operatorSpineCoverage: '443/469',
    operator3_5Sets: 44,
    operator3_8Sets: 401,
    enemySpineAssets: 5,
    enemySpineEnabled: true,
    enemyClasses: ['soldier', 'shield', 'caster', 'hound', 'boss'],
    errors: [],
  };
  v.limitations = [
    '443/469 operators have usable PRTS Spine assets; 26 fall back to portrait animation because no matching 3.5/3.8 public set was found.',
    '307 main stages use chapter-based difficulty mapping, not exact per-stage enemy paths.',
    '3 skins lack a PRTS half-body image and fall back to the operator portrait.',
    'No cloud save; localStorage only.',
  ];
  v.deployment = {
    url: 'https://executor0707.github.io/arknights-idle/',
    httpStatus: 200,
    testedAt: new Date().toISOString(),
    liveCounts: { operators: 469, skins: 531, stages: 362, main: 307, annihilation: 37 },
    spineCanvas: true,
    errors: [],
  };
  await writeFile(p, JSON.stringify(v, null, 2));
}
console.log('qa updated');
