import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=background'});
await new Promise(r=>setTimeout(r,1200));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) {
  await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
  await new Promise(r=>setTimeout(r,1400));
  await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
  await new Promise(r=>setTimeout(r,500));
}
console.log('before', await evalJS(send, `JSON.stringify({hidden:document.hidden,time:__RHODES__.battle.time,status:__RHODES__.battle.status})`));
await evalJS(send, `(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));return true})()`);
await new Promise(r=>setTimeout(r,3500));
console.log('whileHidden', await evalJS(send, `JSON.stringify({hidden:document.hidden,time:__RHODES__.battle.time,status:__RHODES__.battle.status,timer:!!window.__bgProbe})`));
await evalJS(send, `(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'));return true})()`);
await new Promise(r=>setTimeout(r,800));
console.log('visible', await evalJS(send, `JSON.stringify({hidden:document.hidden,time:__RHODES__.battle.time,status:__RHODES__.battle.status})`));
process.exit(0);
