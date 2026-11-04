import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html?v=verifyendless'});
await new Promise(r=>setTimeout(r,1200));
await send('Runtime.evaluate',{expression:`localStorage.clear();location.reload()`,userGesture:true});
await new Promise(r=>setTimeout(r,1200));
await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
await new Promise(r=>setTimeout(r,1500));
await send('Runtime.evaluate',{expression:`document.querySelector('[data-action="tutorial-skip"]')?.click()`,userGesture:true});
await new Promise(r=>setTimeout(r,500));
// click endless tab
await evalJS(send, `document.querySelector('[data-action="stage-group"][data-group="endless"]')?.click();true`);
await new Promise(r=>setTimeout(r,700));
console.log('step0', await evalJS(send, `JSON.stringify({selected:__RHODES__.state.stage.selected,name:__RHODES__.battle.stage.name,ui:document.querySelector('.stage-card')?.textContent.replace(/\\s+/g,' ').trim(),auto:__RHODES__.state.stage.auto})`));
await screenshot(send,'qa/endless-auto-step0.png',1440,1000);
// simulate clear once
await evalJS(send, `__RHODES__.battle._finish(true,'验证自动下一关');true`);
await new Promise(r=>setTimeout(r,3800));
console.log('step1', await evalJS(send, `JSON.stringify({selected:__RHODES__.state.stage.selected,name:__RHODES__.battle.stage.name,status:__RHODES__.battle.status,ui:document.querySelector('.stage-card')?.textContent.replace(/\\s+/g,' ').trim(),auto:__RHODES__.state.stage.auto})`));
await screenshot(send,'qa/endless-auto-step1.png',1440,1000);
// simulate clear second time
await evalJS(send, `__RHODES__.battle._finish(true,'验证自动下一关2');true`);
await new Promise(r=>setTimeout(r,3800));
console.log('step2', await evalJS(send, `JSON.stringify({selected:__RHODES__.state.stage.selected,name:__RHODES__.battle.stage.name,status:__RHODES__.battle.status,ui:document.querySelector('.stage-card')?.textContent.replace(/\\s+/g,' ').trim(),auto:__RHODES__.state.stage.auto})`));
await screenshot(send,'qa/endless-auto-step2.png',1440,1000);
process.exit(0);
