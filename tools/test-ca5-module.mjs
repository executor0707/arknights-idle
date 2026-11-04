import { connect, evalJS } from './cdp.mjs';
const {send}=await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=ca5'});
await new Promise(r=>setTimeout(r,1200));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) {
  await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
  await new Promise(r=>setTimeout(r,1200));
  await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
  await new Promise(r=>setTimeout(r,300));
}
console.log(await evalJS(send, `(()=>{const s=__RHODES__.G.STAGES.find(x=>x.id==='CA-5');const before=__RHODES__.G.itemCount('module');__RHODES__.G.setStage('CA-5');const r=__RHODES__.G.grantStageRewards(s,{silent:true});const after=__RHODES__.G.itemCount('module');return JSON.stringify({name:s.name,items:s.rewards.items,before,after,delta:after-before,granted:r?.items?.module})})()`));
process.exit(0);
