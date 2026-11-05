import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=captext'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,id='char_369_bena';s.operators[id]={level:80,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};__RHODES__.setView('operators',true);document.querySelector('.op-hit[data-id="'+id+'"]')?.click();const text=document.querySelector('.modal-backdrop')?.innerText||'';return JSON.stringify({capText:text.includes('已达等级上限'),promoteText:text.includes('请完成精英化'),excerpt:text.match(/已达等级上限[\\s\\S]{0,30}/)?.[0]})})()`));
process.exit(0);
