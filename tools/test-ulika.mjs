import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=ulika'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,id='char_4091_ulika';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.skins.owned={};s.skins.equipped={};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');return JSON.stringify({allies:b.allies.map(a=>({id:a.id,x:a.x,bard:a.bard,dead:a.dead})),ready:__RHODES__.G?undefined:undefined})})()`));
await new Promise(r=>setTimeout(r,1300));
console.log(await evalJS(send, `(()=>{const token=document.querySelector('.ally-token');const img=token?.querySelector('.portrait img');const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;return JSON.stringify({token:!!token,classes:token?.className,img:img?{src:img.currentSrc||img.src,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight}:null,frameErr:fr?.__frameErr||null,frameReady:fr?.ready,frameUnits:fr?.__frameLast?.units})})()`));
await screenshot(send,'qa/ulika-default.png',1440,1000);
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,id='char_4091_ulika';s.skins.owned[id+'-skin1']=true;s.skins.equipped[id]='skin1';__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');return 'skin'})()`));
await new Promise(r=>setTimeout(r,1400));
console.log(await evalJS(send, `(()=>{const token=document.querySelector('.ally-token');const img=token?.querySelector('.portrait img');const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;return JSON.stringify({token:!!token,classes:token?.className,img:img?{src:img.currentSrc||img.src,naturalWidth:img.naturalWidth}:null,frameErr:fr?.__frameErr||null,frameReady:fr?.ready})})()`));
await screenshot(send,'qa/ulika-skin.png',1440,1000);
process.exit(0);
