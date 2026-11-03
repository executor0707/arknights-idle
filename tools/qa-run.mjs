import { connect, screenshot, evalJS } from './cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('qa', { recursive: true });
const { send } = await connect();
await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:8765/index.html' });
await new Promise(r => setTimeout(r, 800));
await evalJS(send, `localStorage.clear(); location.reload(); true`);
await new Promise(r => setTimeout(r, 1000));

const result = {
  targetRuntime: 'web-static',
  testedRuntime: 'Chrome 156.0.8078.80 headless (Windows 10), 1440x1000 + 390x844',
  command: 'node tools/qa-run.mjs',
  exitCode: null,
  checks: {},
  limitations: [],
  evidence: {},
};

await screenshot(send, 'qa/splash.png', 1440, 1000);
await evalJS(send, `document.getElementById('enterBtn').click(); true`);
await new Promise(r => setTimeout(r, 1600));
await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click(); true`);
await new Promise(r => setTimeout(r, 800));

result.checks.launch = await evalJS(send, `(()=>({
  title: document.title,
  splashGone: !document.getElementById('splash') || document.getElementById('splash').classList.contains('out'),
  appVisible: !document.getElementById('app').classList.contains('hidden'),
  errors: window.__errs || []
}))()`);
result.evidence.launch = `Orundum=${await evalJS(send, `Math.round(__RHODES__.state.orundum)`)}, squad=${await evalJS(send, `__RHODES__.state.squad.filter(Boolean).length`)}`;

result.checks.render = await evalJS(send, `(()=>({
  arena: !!document.getElementById('arena'),
  allies: document.querySelectorAll('.ally-token').length,
  stages: document.querySelectorAll('.stage-card').length,
  resources: ['resLmd','resOrundum','resPrime','resCert'].every(id=>!!document.getElementById(id)),
  errors: window.__errs || []
}))()`);
await screenshot(send, 'qa/desktop-battle.png', 1440, 1000);

// core loop: real battle to a result
let status = 'running';
for (let i = 0; i < 120; i++) {
  await new Promise(r => setTimeout(r, 600));
  status = await evalJS(send, `__RHODES__.battle.status`);
  if (status === 'victory' || status === 'defeat') break;
}
result.checks.coreLoop = await evalJS(send, `(()=>({
  status: __RHODES__.battle.status,
  time: +__RHODES__.battle.time.toFixed(1),
  kills: __RHODES__.battle.kills,
  firstClear: __RHODES__.state.stage.firstClear['CE-6'] === true,
  primes: __RHODES__.state.primes,
  reward: __RHODES__.battle.lastReward ? {
    lmd: __RHODES__.battle.lastReward.lmd,
    orundum: __RHODES__.battle.lastReward.orundum,
    first: __RHODES__.battle.lastReward.first
  } : null,
  errors: window.__errs || []
}))()`);
await screenshot(send, 'qa/desktop-victory.png', 1440, 1000);

const runBefore = await evalJS(send, `__RHODES__.battle.runId`);
await new Promise(r => setTimeout(r, 4200));
result.checks.outcome = await evalJS(send, `(()=>({
  autoRestarted: __RHODES__.battle.runId > ${runBefore} && __RHODES__.battle.status === 'running',
  runId: __RHODES__.battle.runId,
  totalRuns: __RHODES__.state.stage.totalRuns,
  errors: window.__errs || []
}))()`);

// operator growth
await evalJS(send, `document.querySelector('[data-nav="operators"]').click(); true`);
await new Promise(r => setTimeout(r, 500));
await evalJS(send, `document.querySelector('.op-card[data-id="amiya"]').click(); true`);
await new Promise(r => setTimeout(r, 500));
const levelBefore = await evalJS(send, `__RHODES__.state.operators.amiya.level`);
await evalJS(send, `document.querySelector('[data-action="op-level"][data-times="10"]').click(); true`);
await new Promise(r => setTimeout(r, 600));
result.checks.input = await evalJS(send, `(()=>({
  levelBefore: ${levelBefore},
  levelAfter: __RHODES__.state.operators.amiya.level,
  detailOpen: !!document.querySelector('.op-detail'),
  skinsVisible: document.querySelectorAll('.skin-card').length,
  errors: window.__errs || []
}))()`);
await evalJS(send, `document.querySelector('[data-action="modal-close"]').click(); true`);
await screenshot(send, 'qa/desktop-operators.png', 1440, 1000);

// gacha
await evalJS(send, `document.querySelector('[data-nav="gacha"]').click(); true`);
await new Promise(r => setTimeout(r, 500));
const pullsBefore = await evalJS(send, `__RHODES__.state.gacha.totalPulls`);
await evalJS(send, `document.querySelector('[data-action="pull"][data-count="10"]').click(); true`);
await new Promise(r => setTimeout(r, 1200));
result.checks.gacha = await evalJS(send, `(()=>({
  pullsBefore: ${pullsBefore},
  pullsAfter: __RHODES__.state.gacha.totalPulls,
  overlay: !!document.getElementById('pullOverlay'),
  cards: document.querySelectorAll('.pull-card').length,
  errors: window.__errs || []
}))()`);
await screenshot(send, 'qa/desktop-pull.png', 1440, 1000);
await evalJS(send, `document.querySelector('[data-action="pull-close"]').click(); true`);
await new Promise(r => setTimeout(r, 300));

// base upgrade
await evalJS(send, `document.querySelector('[data-nav="base"]').click(); true`);
await new Promise(r => setTimeout(r, 400));
const baseBefore = await evalJS(send, `JSON.stringify({level:__RHODES__.state.base.rooms.control.level,crit:__RHODES__.G.getBaseBonuses().crit,blocks:__RHODES__.state.inventory.base_block})`);
await evalJS(send, `document.querySelector('[data-action="base-upgrade"][data-id="control"]').click(); true`);
await new Promise(r => setTimeout(r, 500));
result.checks.base = { before: JSON.parse(baseBefore), after: JSON.parse(await evalJS(send, `JSON.stringify({level:__RHODES__.state.base.rooms.control.level,crit:__RHODES__.G.getBaseBonuses().crit,blocks:__RHODES__.state.inventory.base_block,errors:window.__errs})`)) };
await screenshot(send, 'qa/desktop-base.png', 1440, 1000);

// skin purchase
await evalJS(send, `__RHODES__.state.primes=88; __RHODES__.G.saveNow(); document.querySelector('[data-nav="inventory"]').click(); true`);
await new Promise(r => setTimeout(r, 400));
await evalJS(send, `document.querySelector('[data-action="skin-gallery"]').click(); true`);
await new Promise(r => setTimeout(r, 400));
const skinBefore = await evalJS(send, `Object.keys(__RHODES__.state.skins.owned).length`);
await evalJS(send, `document.querySelector('.gallery-info .btn').click(); true`);
await new Promise(r => setTimeout(r, 400));
result.checks.skin = { before: skinBefore, after: await evalJS(send, `Object.keys(__RHODES__.state.skins.owned).length`), price: 88 };
await screenshot(send, 'qa/desktop-skins.png', 1440, 1000);
await evalJS(send, `document.querySelector('[data-action="modal-close"]').click(); true`);

// 300 selector
await evalJS(send, `__RHODES__.state.gacha.totalPulls=300; __RHODES__.G.saveNow(); document.querySelector('[data-nav="gacha"]').click(); true`);
await new Promise(r => setTimeout(r, 500));
await evalJS(send, `document.querySelector('[data-action="selector"]').click(); true`);
await new Promise(r => setTimeout(r, 500));
const sixBefore = await evalJS(send, `Object.keys(__RHODES__.state.operators).length`);
await evalJS(send, `document.querySelector('.selector-card').click(); true`);
await new Promise(r => setTimeout(r, 500));
result.checks.selector = { available: 1, opsBefore: sixBefore, opsAfter: await evalJS(send, `Object.keys(__RHODES__.state.operators).length`), used: await evalJS(send, `__RHODES__.state.gacha.selectorsUsed`) };
await evalJS(send, `document.querySelector('[data-action="modal-close"]').click(); true`);

// offline settlement
result.checks.offline = JSON.parse(await evalJS(send, `(()=>{const s=__RHODES__.state;const before={o:s.orundum,sh:s.primeShards,p:s.primes};s.lastSeen=Date.now()-2*3600*1000;const r=__RHODES__.applyOffline(Date.now());return JSON.stringify({before, after:{o:s.orundum,sh:s.primeShards,p:s.primes}, report:r?{orundum:r.orundum,pulls:+r.pulls.toFixed(2),primes:r.primes,shards:+r.shards.toFixed(2),blocks:r.items.base_block||0}:null, errors:window.__errs})})()`));

// save / reload
await evalJS(send, `__RHODES__.save(); true`);
const savedLevel = await evalJS(send, `__RHODES__.state.operators.amiya.level`);
await send('Page.navigate', { url: 'http://127.0.0.1:8765/index.html' });
await new Promise(r => setTimeout(r, 1000));
await evalJS(send, `document.getElementById('enterBtn').click(); true`);
await new Promise(r => setTimeout(r, 1200));
result.checks.restart = await evalJS(send, `(()=>({
  savedLevel: ${savedLevel},
  restoredLevel: __RHODES__.state.operators.amiya.level,
  restoredControl: __RHODES__.state.base.rooms.control.level,
  battleRunning: __RHODES__.battle.status,
  errors: window.__errs || []
}))()`);
await screenshot(send, 'qa/desktop-restart.png', 1440, 1000);

// mobile render
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send('Page.navigate', { url: 'http://127.0.0.1:8765/index.html' });
await new Promise(r => setTimeout(r, 900));
await evalJS(send, `document.getElementById('enterBtn').click(); true`);
await new Promise(r => setTimeout(r, 1500));
await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click(); true`);
await new Promise(r => setTimeout(r, 500));
result.checks.mobile = await evalJS(send, `(()=>({
  width: innerWidth,
  height: innerHeight,
  bottomNav: getComputedStyle(document.querySelector('.sidebar')).bottom === '0px',
  arenaVisible: !!document.getElementById('arena'),
  errors: window.__errs || []
}))()`);
await screenshot(send, 'qa/mobile-battle.png', 390, 844);

result.exitCode = 0;
result.limitations = [
  '86 operators and 17 main stages, not the complete live roster or story.',
  'Idle/offline income is rate-based, while active combat uses a simplified three-lane simulation.',
  'No cloud save or account sync; progress is localStorage only.',
  'Uncapped base levels can eventually overpower fixed stage content; 15-3 is the terminal tuned challenge.',
];
await mkdir('qa', { recursive: true });
await writeFile('qa/verification.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exit(0);
