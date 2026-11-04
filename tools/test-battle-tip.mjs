import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=tiptest'});
await new Promise(r=>setTimeout(r,1200));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) {
  await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
  await new Promise(r=>setTimeout(r,1400));
  await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
  await new Promise(r=>setTimeout(r,500));
}
await evalJS(send, `document.querySelector('[data-action="close-modal"]')?.click();true`);
await new Promise(r=>setTimeout(r,400));
console.log(await evalJS(send, `(()=>{const t=document.querySelector('.battle-size-tip');const r=t?.getBoundingClientRect();return JSON.stringify({exists:!!t,text:t?.innerText,rect:r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null,headRight:Math.round(document.querySelector('.page-head-right')?.getBoundingClientRect().right||0),view:innerWidth})})()`));
await screenshot(send,'.cache/battle-size-tip.png',1440,1000);
process.exit(0);
