import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=hailing6'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state,id='char_4186_tmoris';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const a=b.allies[0];b._spawnEnemy({type:'boss',wave:1,boss:true,lane:0,bossKey:'boss_skulsr'});const e=b.enemies[0];e.stun=0;b._castSkill(a);return JSON.stringify({skill:G.OP_BY_ID.get(id).skill,stun:+e.stun.toFixed(2),talent:G.talentText(id)})})()`));
process.exit(0);
