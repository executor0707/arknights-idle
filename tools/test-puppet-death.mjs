import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=puppetdeath'});
await new Promise(r=>setTimeout(r,3500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const id='char_369_bena';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const body=b.allies[0];b._damageAlly(body,body.maxHp+1000);const sub=b.allies[0];b._damageAlly(sub,sub.maxHp+1000);return JSON.stringify({subDead:sub.dead,bodyDead:body.dead,currentDead:b.allies[0].dead,count:b.allies.length})})()`));
process.exit(0);
