import { connect, evalJS } from './cdp.mjs';
import path from 'node:path';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('DOM.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=maxsave'});
await new Promise(r=>setTimeout(r,2500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1400)); }
const { root } = await send('DOM.getDocument');
const { nodeId } = await send('DOM.querySelector',{nodeId:root.nodeId,selector:'#saveImport'});
console.log('input',nodeId);
await send('DOM.setFileInputFiles',{files:[path.resolve('rhodes-idle-max-no-stages.json')],nodeId});
await new Promise(r=>setTimeout(r,5000));
console.log(await evalJS(send, `JSON.stringify({rhodes:!!__RHODES__,label:document.querySelector('#enterLabel')?.textContent,ops:__RHODES__?Object.keys(__RHODES__.state.operators).length:0})`));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1400)); }
await evalJS(send, `__RHODES__.setView('operators',true);window.__err=null;window.onerror=(m,src,l,c,e)=>window.__err={m,stack:e?.stack};const c=document.querySelector('.op-card');c?.click();true`);
await new Promise(r=>setTimeout(r,700));
console.log(await evalJS(send, `JSON.stringify({err:window.__err,first:document.querySelector('.op-card')?.dataset.id,modal:!!document.querySelector('.modal-backdrop'),text:document.querySelector('.modal-backdrop')?.innerText?.slice(0,160)})`));
process.exit(0);
