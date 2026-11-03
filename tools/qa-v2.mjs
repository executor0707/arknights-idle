import { connect, screenshot, evalJS } from './cdp.mjs';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('qa', { recursive: true });
const { send } = await connect();
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:8765/index.html?v=qa2' });
await new Promise(r => setTimeout(r, 900));
await evalJS(send, `localStorage.clear(); location.reload(); true`);
await new Promise(r => setTimeout(r, 900));
await evalJS(send, `document.getElementById('enterBtn').click(); true`);
await new Promise(r => setTimeout(r, 1700));
await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click(); true`);
await new Promise(r => setTimeout(r, 700));

const out = {
  targetRuntime: 'web-static',
  testedRuntime: 'Chrome 156.0.8078.80 headless / Windows 10 / PC 1920x1080 + 1440x1000',
  build: 'v2 full-roster',
  checks: {},
  limitations: [],
};
out.checks.launch = await evalJS(send, `(()=>({title:document.title,app:!document.getElementById('app').classList.contains('hidden'),errors:window.__errs||[]}))()`);
out.checks.render = await evalJS(send, `(()=>({
  operators: __RHODES__.G.OPERATORS.length,
  skins: __RHODES__.G.SKINS.length,
  stages: __RHODES__.G.STAGES.length,
  main: __RHODES__.G.STAGES.filter(s=>s.group==='main').length,
  annihilation: __RHODES__.G.STAGES.filter(s=>s.group==='annihilation').length,
  arena: !!document.getElementById('arena'),
  allies: document.querySelectorAll('.ally-token').length,
  stageCards: document.querySelectorAll('.stage-card').length,
  errors: window.__errs||[]
}))()`);
await screenshot(send, 'qa/v2-desktop.png', 1920, 1080);

let status = 'running';
for (let i = 0; i < 120; i++) {
  await new Promise(r => setTimeout(r, 600));
  status = await evalJS(send, `__RHODES__.battle.status`);
  if (status === 'victory' || status === 'defeat') break;
}
out.checks.coreLoop = await evalJS(send, `(()=>({
  status: __RHODES__.battle.status,
  time: +__RHODES__.battle.time.toFixed(1),
  kills: __RHODES__.battle.kills,
  firstClear: __RHODES__.state.stage.firstClear['CE-6']===true,
  primes: __RHODES__.state.primes,
  errors: window.__errs||[]
}))()`);
await screenshot(send, 'qa/v2-victory.png', 1920, 1080);
await new Promise(r => setTimeout(r, 4200));
out.checks.outcome = await evalJS(send, `(()=>({restarted:__RHODES__.battle.status==='running',runId:__RHODES__.battle.runId,errors:window.__errs||[]}))()`);

// Full main chapter and annihilation catalogs
await evalJS(send, `document.querySelector('[data-action="stage-group"][data-group="main"]').click(); true`);
await new Promise(r => setTimeout(r, 350));
out.checks.mainCatalog = await evalJS(send, `(()=>({
  chapterOptions: document.querySelectorAll('#stageChapterSelect option').length,
  currentCards: document.querySelectorAll('.stage-card').length,
  firstCode: document.querySelector('.stage-card')?.innerText.split('\\n')[0],
  hasChapterSelect: !!document.getElementById('stageChapterSelect')
}))()`);
await evalJS(send, `document.querySelector('[data-action="stage-group"][data-group="annihilation"]').click(); true`);
await new Promise(r => setTimeout(r, 350));
out.checks.annihilation = await evalJS(send, `(()=>({cards:document.querySelectorAll('.stage-card').length,first:document.querySelector('.stage-card')?.innerText.split('\\n')[2]}))()`);

// gacha
await evalJS(send, `document.querySelector('[data-nav="gacha"]').click(); true`);
await new Promise(r => setTimeout(r, 400));
await evalJS(send, `document.querySelector('[data-action="pull"][data-count="10"]').click(); true`);
await new Promise(r => setTimeout(r, 1000));
out.checks.gacha = await evalJS(send, `(()=>({cards:document.querySelectorAll('.pull-card').length,overlay:!!document.getElementById('pullOverlay'),pulls:__RHODES__.state.gacha.totalPulls,errors:window.__errs||[]}))()`);
await screenshot(send, 'qa/v2-pull.png', 1920, 1080);
await evalJS(send, `document.querySelector('[data-action="pull-close"]').click(); true`);
await new Promise(r => setTimeout(r, 300));

// 300 selector
await evalJS(send, `__RHODES__.state.gacha.totalPulls=300; __RHODES__.G.saveNow(); __RHODES__.setView('gacha', true); true`);
await new Promise(r => setTimeout(r, 500));
await evalJS(send, `document.querySelector('[data-action="selector"]')?.click(); true`);
await new Promise(r => setTimeout(r, 500));
out.checks.selector = await evalJS(send, `(()=>({cards:document.querySelectorAll('.selector-card').length,available:__RHODES__.G.selectorsAvailable(),errors:window.__errs||[]}))()`);
await screenshot(send, 'qa/v2-selector.png', 1920, 1080);
await evalJS(send, `document.querySelector('[data-action="modal-close"]').click(); true`);

// Skin store 18 primes
await evalJS(send, `__RHODES__.state.primes=100; __RHODES__.G.saveNow(); document.querySelector('[data-nav="skins"]').click(); true`);
await new Promise(r => setTimeout(r, 500));
out.checks.skins = await evalJS(send, `(()=>({cards:document.querySelectorAll('.gallery-card').length,price:__RHODES__.G.SKIN_PRICE,primes:__RHODES__.state.primes,errors:window.__errs||[]}))()`);
const beforeOwned = await evalJS(send, `Object.keys(__RHODES__.state.skins.owned).length`);
await evalJS(send, `document.querySelector('.gallery-info .btn').click(); true`);
await new Promise(r => setTimeout(r, 400));
out.checks.skinPurchase = { before: beforeOwned, after: await evalJS(send, `Object.keys(__RHODES__.state.skins.owned).length`), primesAfter: await evalJS(send, `__RHODES__.state.primes`) };
await screenshot(send, 'qa/v2-skins.png', 1920, 1080);

// operator growth
await evalJS(send, `document.querySelector('[data-nav="operators"]').click(); true`);
await new Promise(r => setTimeout(r, 400));
await evalJS(send, `document.querySelector('.op-card[data-id="amiya"]').click(); true`);
await new Promise(r => setTimeout(r, 400));
const lvlBefore = await evalJS(send, `__RHODES__.state.operators.amiya.level`);
await evalJS(send, `document.querySelector('[data-action="op-level"][data-times="10"]').click(); true`);
await new Promise(r => setTimeout(r, 400));
out.checks.operator = { levelBefore: lvlBefore, levelAfter: await evalJS(send, `__RHODES__.state.operators.amiya.level`), skinsInDetail: await evalJS(send, `document.querySelectorAll('.skin-card').length`) };
await evalJS(send, `document.querySelector('[data-action="modal-close"]').click(); true`);

// save / reload
await evalJS(send, `__RHODES__.save(); true`);
await send('Page.navigate', { url: 'http://127.0.0.1:8765/index.html?v=qa2r' });
await new Promise(r => setTimeout(r, 1000));
await evalJS(send, `document.getElementById('enterBtn').click(); true`);
await new Promise(r => setTimeout(r, 1000));
out.checks.restart = await evalJS(send, `(()=>({level:__RHODES__.state.operators.amiya.level,skins:Object.keys(__RHODES__.state.skins.owned).length,battle:__RHODES__.battle.status,errors:window.__errs||[]}))()`);

// offline
out.checks.offline = JSON.parse(await evalJS(send, `(()=>{const s=__RHODES__.state;s.lastSeen=Date.now()-2*3600*1000;const r=__RHODES__.applyOffline(Date.now());return JSON.stringify({orundum:Math.round(r.orundum),pulls:+r.pulls.toFixed(2),shards:+r.shards.toFixed(2),blocks:r.items.base_block||0})})()`));

// 1440 layout
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://127.0.0.1:8765/index.html?v=qa2-1440' });
await new Promise(r => setTimeout(r, 1000));
await evalJS(send, `document.getElementById('enterBtn').click(); true`);
await new Promise(r => setTimeout(r, 1500));
await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click(); true`);
await new Promise(r => setTimeout(r, 500));
out.checks.desktop1440 = await evalJS(send, `(()=>({width:innerWidth,scrollWidth:document.body.scrollWidth,col:getComputedStyle(document.querySelector('.battle-layout')).gridTemplateColumns,errors:window.__errs||[]}))()`);
await screenshot(send, 'qa/v2-1440.png', 1440, 1000);

out.limitations = [
  'PRTS 的干员 Spine 是 3.5.51 二进制格式；本次战斗演出使用立绘攻击位移、弹道、受击、技能横幅与技能立绘切入，未启用官方 Spine 骨骼动画。',
  '307 个主线节点使用章节难度映射，不是逐个复刻原作敌人路径。',
  '皮肤商店已收录 531 套；3 套 PRTS 缺少半身像时使用对应干员默认立绘。',
  '无云存档，进度保存在浏览器 localStorage。',
];
out.exitCode = 0;
await writeFile('qa/verification-v2.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.exit(0);
