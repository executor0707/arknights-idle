import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=summons'});
await new Promise(r=>setTimeout(r,1400));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1400)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log('audit', await evalJS(send, `(()=>{const m=__RHODES__.G.OPERATORS;const a=m.filter(o=>/弹药|子弹|装填/.test(o.skill?.desc||'')).map(o=>o.id);const g=m.filter(o=>/职业模板|自动释放.*对战场产生效果/.test(o.skill?.desc||'')).map(o=>o.id);const s=m.filter(o=>o.skill?.type==='summon').map(o=>[o.id,o.skill.summonName,o.skill.count,o.skill.duration]);return JSON.stringify({total:m.length,ammo:a,generic:g,summons:s})})()`));
console.log('summon', await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const id='char_391_rosmon';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');b._castSkill(b.allies[0]);const ph=b.allies.filter(a=>a.phantom);return JSON.stringify({skill:G.OP_BY_ID.get(id)?.skill,phantoms:ph.map(a=>({name:a.name,summonName:a.summonName,hp:Math.round(a.maxHp)})),names:[...document.querySelectorAll('.unit-name')].map(x=>x.textContent)})})()`));
await new Promise(r=>setTimeout(r,300));
process.exit(0);
