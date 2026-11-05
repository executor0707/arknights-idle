import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=puppetnskill'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const out=[];for(const id of ['char_4124_iana','char_4107_vrdant','char_4183_mortis']){s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const body=b.allies[0];b._damageAlly(body,body.maxHp+1000);const sub=b.allies[0];out.push({id,duration:sub.puppetDuration,skill:sub.puppetSkill?.name||null,spRate:sub.spRate,maxSp:sub.maxSp});}return JSON.stringify(out)})()`));
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,id='char_4124_iana';__RHODES__.setView('operators',true);document.querySelector('.op-hit[data-id="'+id+'"]')?.click();const root=document.querySelector('.modal-backdrop');return JSON.stringify({hasPuppetSkill:!![...root.querySelectorAll('.detail-section-head b')].find(x=>x.textContent==='傀儡技能'),hasTalent:root.innerText.includes('没有独立技能')})})()`));
process.exit(0);
