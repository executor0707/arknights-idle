import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html?v=finalqa'});
await new Promise(r=>setTimeout(r,1200));
await send('Runtime.evaluate',{expression:`localStorage.clear();location.reload()`,userGesture:true});
await new Promise(r=>setTimeout(r,1200));
await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
await new Promise(r=>setTimeout(r,1500));
await send('Runtime.evaluate',{expression:`document.querySelector('[data-action="tutorial-skip"]')?.click()`,userGesture:true});
await new Promise(r=>setTimeout(r,500));
await evalJS(send, `window.__QA_ERRORS=[];window.addEventListener('error',e=>__QA_ERRORS.push(String(e.message)));window.addEventListener('unhandledrejection',e=>__QA_ERRORS.push(String(e.reason)));true`);
const views = ['battle','operators','gacha','skins','base','inventory','archive','events'];
for (const v of views) {
  const t0 = Date.now();
  await evalJS(send, `__RHODES__.setView('${v}',true);true`);
  await new Promise(r=>setTimeout(r,350));
  const r = await evalJS(send, `JSON.stringify({view:'${v}',len:document.querySelector('#view')?.innerText.length||0,buttons:document.querySelectorAll('#view button').length,cards:document.querySelectorAll('#view .panel,.gallery-card,.op-card,.stage-card,.room-card').length})`);
  console.log((Date.now()-t0)+'ms', r);
}
console.log('errors', await evalJS(send, `JSON.stringify(window.__QA_ERRORS||[])`));
// archive export/import buttons
await evalJS(send, `__RHODES__.setView('archive',true);true`);
await new Promise(r=>setTimeout(r,300));
console.log('archive ops', await evalJS(send, `JSON.stringify({export:document.querySelector('[data-action="export-save"]')?.textContent,import:document.querySelector('[data-action="import-save"]')?.textContent})`));
// base power values
console.log('base', await evalJS(send, `JSON.stringify({powerGain:__RHODES__.G.baseLevelPowerGain(),summary:__RHODES__.G.baseSummary()})`));
// mobile battle
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await evalJS(send, `__RHODES__.setView('battle',true);true`);
await new Promise(r=>setTimeout(r,600));
console.log('mobile', await evalJS(send, `JSON.stringify({innerW:innerWidth,scrollW:document.documentElement.scrollWidth,bodyW:document.body.clientWidth,stageCard:document.querySelector('.stage-card')?.getBoundingClientRect().width,arena:document.querySelector('.arena')?.getBoundingClientRect().width})`));
await screenshot(send,'.cache/final-mobile-battle.png',390,844);
process.exit(0);
