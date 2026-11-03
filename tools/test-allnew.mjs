import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html?v=allnew'});
await new Promise(r=>setTimeout(r,1000));
await evalJS(send,`localStorage.clear();location.reload();true`);
await new Promise(r=>setTimeout(r,1000));
await evalJS(send,`document.getElementById('enterBtn').click();true`);
await new Promise(r=>setTimeout(r,1700));
await evalJS(send,`document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
await new Promise(r=>setTimeout(r,800));
console.log('base', await evalJS(send,`JSON.stringify({stages:__RHODES__.G.STAGES.length,ca:__RHODES__.G.STAGE_BY_ID.get('CA-5')?.rewards,module:__RHODES__.G.moduleReqInfo('amiya'),endless1:__RHODES__.G.STAGE_BY_ID.get('endless-1')?.idle?.orundumPerHour,cap:__RHODES__.G.maxEndlessPower()})`));
console.log('costs', await evalJS(send,`(()=>{const s=__RHODES__.state.operators.amiya;s.level=80;s.elite=1;const p=__RHODES__.G.promotionInfo('amiya');s.level=1;s.elite=0;return JSON.stringify({promo:p.cost,skill:__RHODES__.G.skillReqInfo('amiya').cost})})()`));
console.log('rewards', await evalJS(send,`JSON.stringify({main:__RHODES__.G.STAGES.find(s=>s.id==='main-0-1').rewards,ann:__RHODES__.G.STAGES.find(s=>s.id==='ann-1').rewards})`));
console.log('endless325', await evalJS(send,`(()=>{const s=__RHODES__.G.ensureEndlessFloor(325);const t=__RHODES__.G.ensureEndlessFloor(326);return JSON.stringify({id:s.id,rec:s.rec,pulls:s.idle.orundumPerHour/600,after:t.id})})()`));
// random events
console.log('events', await evalJS(send,`(()=>{let ev=null;for(let i=0;i<80&&!ev;i++){__RHODES__.state.randomEvent.nextAt=0;ev=__RHODES__.G.checkRandomEvent();}return JSON.stringify({event:ev?.event?.id,result:ev?.result,log:__RHODES__.state.randomEvent.log.length})})()`));
// pause overlay
await evalJS(send,`document.querySelector('[data-action="pause"]')?.click();true`);
await new Promise(r=>setTimeout(r,300));
console.log('pause', await evalJS(send,`JSON.stringify({paused:__RHODES__.battle.paused,hidden:document.getElementById('arenaPause').classList.contains('hidden'),btn:!!document.querySelector('#arenaPause [data-action="pause"]')})`));
await screenshot(send,'.cache/all-pause.png',1440,1000);
await evalJS(send,`document.querySelector('#arenaPause [data-action="pause"]')?.click();true`);
// amiya forms
console.log('amiya', await evalJS(send,`(()=>{const s=__RHODES__.state.stage;s.cleared.push('main-R8-11','main-14-23');__RHODES__.G.unlockAmiyaForms();__RHODES__.setView('operators',true);return JSON.stringify({guard:!!s.operators['char_1001_amiya2'],medic:!!s.operators['char_1037_amiya3'],skin1:__RHODES__.G.SKINS?.find?.(x=>false)})})()`));
// skin file paths via module not exposed; skip
process.exit(0);
