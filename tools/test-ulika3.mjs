import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=ulika3'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,id='char_4091_ulika';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};delete s.skins.owned[id+'-skin1'];delete s.skins.equipped[id];s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');return 'default'})()`));
await new Promise(r=>setTimeout(r,1800));
console.log(await evalJS(send, `(()=>{const t=document.querySelector('.ally-token');const i=t?.querySelector('.portrait img');const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const sp=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))sp.push({anim:v._anim});return JSON.stringify({cls:t?.className,imgOpacity:i?getComputedStyle(i.parentElement).opacity:null,log:window.__SPINE_LOG__||[],err:fr?.__frameErr||null,sp})})()`));
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,id='char_4091_ulika';s.skins.owned[id+'-skin1']=true;s.skins.equipped[id]='skin1';__RHODES__.setView('battle',true);__RHODES__.battle.start('CE-6');return 'skin'})()`));
await new Promise(r=>setTimeout(r,1800));
console.log(await evalJS(send, `(()=>{const t=document.querySelector('.ally-token');const i=t?.querySelector('.portrait img');return JSON.stringify({cls:t?.className,imgOpacity:i?getComputedStyle(i.parentElement).opacity:null})})()`));
process.exit(0);
