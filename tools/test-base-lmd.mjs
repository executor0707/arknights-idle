import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=baselmd'});
await new Promise(r=>setTimeout(r,1500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,G=__RHODES__.G;s.base.rooms.trade.level=20;__RHODES__.setView('battle',true);const idle=G.idleSummary();const base=G.baseSummary();return JSON.stringify({stageLmd:Math.round(idle.lmdPerHour),baseLmd:Math.round(base.lmdPerHour),total:Math.round(idle.lmdPerHour+base.lmdPerHour),stats:[...document.querySelectorAll('.mini-stat')].map(x=>[x.querySelector('span')?.textContent,x.querySelector('b')?.textContent]),note:[...document.querySelectorAll('.small')].map(x=>x.textContent).find(x=>x.includes('龙门币拆分'))})})()`));
process.exit(0);
