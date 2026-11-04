import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=skill7'});
await new Promise(r=>setTimeout(r,1500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;__RHODES__.setView('operators',true);const id=document.querySelector('.op-hit')?.dataset.id;const d=G.OP_BY_ID.get(id);s.operators[id]={level:G.levelCap(d.rarity,2),elite:2,potential:1,skill:7,mastery:0,trust:0,module:0,exp:0};window.__err=null;window.onerror=(m,src,l,c,e)=>window.__err={m,stack:e?.stack};__RHODES__.setView('operators',true);document.querySelector('.op-hit[data-id="'+id+'"]')?.click();const m=document.querySelector('.modal-backdrop');return JSON.stringify({id,name:d.name,skill:G.skillReqInfo(id),modal:!!m,err:window.__err,text:m?.innerText?.match(/技能[\\s\\S]{0,160}/)?.[0]})})()`));
process.exit(0);
