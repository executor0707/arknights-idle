import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=medicdesc'});
await new Promise(r=>setTimeout(r,3500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state,id='char_450_necras';const med=G.OPERATORS.find(o=>o.cls==='医疗');for(const o of [G.OP_BY_ID.get(id),med])s.operators[o.id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};const check=(id)=>{__RHODES__.setView('operators',true);document.querySelector('.op-hit[data-id="'+id+'"]')?.click();const t=document.querySelector('.modal-backdrop')?.innerText||'';return {text:t.includes('医疗可以治疗满血友军'),green:t.includes('绿色伤害')}};const non=check(id);document.querySelector('.modal-close')?.click();const healer=check(med.id);return JSON.stringify({medic:med.name,non,healer})})()`));
process.exit(0);
