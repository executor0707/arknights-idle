import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=shield8'});
await new Promise(r=>setTimeout(r,2000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1800)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,G=__RHODES__.G;const id='char_4131_odda';s.operators[id]={level:90,elite:2,potential:1,skill:7,mastery:0,trust:0,module:0,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const a=b.allies[0];b._castSkill(a);const at0=a.shieldT;b.tick(7.8);const at78=a.shieldT;const sh78=a.shield;return JSON.stringify({skill:G.OP_BY_ID.get(id)?.skill,shieldT:at0,shieldDuring:a.shield,maxHp:Math.round(a.maxHp),at78,sh78})})()`));
process.exit(0);
