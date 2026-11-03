import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html?v=march1'});
await new Promise(r=>setTimeout(r,1000));
await evalJS(send,`localStorage.clear();location.reload();true`);
await new Promise(r=>setTimeout(r,1000));
await evalJS(send,`document.getElementById('enterBtn').click();true`);
await new Promise(r=>setTimeout(r,1700));
await evalJS(send,`document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
await new Promise(r=>setTimeout(r,1200));
console.log('state', await evalJS(send,`JSON.stringify({max:__RHODES__.G.MAX_SQUAD,squad:__RHODES__.state.squad.length,allies:__RHODES__.battle.allies.length,battleStage:__RHODES__.battle.stage?.id,errs:window.__errs||null})`));
console.log('dom', await evalJS(send,`JSON.stringify({march:document.getElementById('arena')?.className,allies:document.querySelectorAll('.ally-token').length,spine:document.querySelectorAll('.ally-token.spine-unit').length,enemies:document.querySelectorAll('.enemy-token').length,bg:!!document.querySelector('.march-far')})`));
await screenshot(send,'.cache/march-battle.png',1440,1000);
// resource stage
await evalJS(send,`document.querySelector('[data-action="stage-group"][data-group="resource"]')?.click();true`);
await new Promise(r=>setTimeout(r,400));
await evalJS(send,`document.querySelector('.stage-card')?.click();true`);
await new Promise(r=>setTimeout(r,1000));
await screenshot(send,'.cache/march-resource.png',1440,1000);
// endless
await evalJS(send,`document.querySelector('[data-action="stage-group"][data-group="endless"]')?.click();true`);
await new Promise(r=>setTimeout(r,400));
await evalJS(send,`document.querySelector('.stage-card')?.click();true`);
await new Promise(r=>setTimeout(r,1200));
await screenshot(send,'.cache/march-endless.png',1440,1000);
console.log('after', await evalJS(send,`JSON.stringify({stage:__RHODES__.battle.stage?.id,allies:__RHODES__.battle.allies.length,enemies:__RHODES__.battle.enemies.length,errs:window.__errs||null})`));
process.exit(0);
