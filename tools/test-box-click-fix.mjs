import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=boxfix'});
await new Promise(r=>setTimeout(r,1500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{__RHODES__.setView('operators',true);const c=document.querySelector('.op-card');const r=c.getBoundingClientRect();return JSON.stringify({id:c.dataset.id,rect:[r.x,r.y,r.width,r.height],top:document.elementFromPoint(r.x+10,r.y+10)?.tagName,child:c.querySelector('img')?.draggable})})()`));
const pts=[[12,12],[r=>r.width/2,r=>r.height/2],[r=>r.width-12,r=>r.height-12]];
for (let i=0;i<3;i++) {
  const p=await evalJS(send, `(()=>{const c=document.querySelector('.op-card');const r=c.getBoundingClientRect();return JSON.stringify({x:r.x+${i===0?'10':i===1?'r.width/2':'r.width-10'},y:r.y+${i===0?'10':i===1?'r.height/2':'r.height-10'}})})()`);
  const {x,y}=JSON.parse(p);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
  await new Promise(r=>setTimeout(r,250));
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
  await new Promise(r=>setTimeout(r,350));
  console.log(i, await evalJS(send, `JSON.stringify({modal:!!document.querySelector('.modal-backdrop'),name:document.querySelector('.modal-backdrop .odh-name')?.textContent})`));
  await evalJS(send, `document.querySelector('[data-action="modal-close"]')?.click();true`);
  await new Promise(r=>setTimeout(r,250));
}
process.exit(0);
