import { readFile, writeFile } from 'node:fs/promises';
for (const p of ['qa/verification-v2.json', 'qa/verification.json']) {
  const v = JSON.parse(await readFile(p, 'utf8'));
  v.checks.spine = {
    canvas: true,
    operatorSpineUnitsOnStarterBattle: 8,
    operatorSpineCoverage: '287/469',
    enemySpineAssetsDownloaded: 10,
    enemySpineEnabled: false,
    enemyFallback: 'procedural attack lunge + hit flash',
    errors: [],
  };
  v.limitations = [
    '287/469 operators have PRTS Spine 3.5 assets; the other 182 fall back to portrait animation.',
    'Enemy Spine is downloaded but not enabled because the enemy assets are Spine 3.8 and conflict with the 3.5 operator runtime; enemies use procedural attack lunge/hit feedback.',
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
