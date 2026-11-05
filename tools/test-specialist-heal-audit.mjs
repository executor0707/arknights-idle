import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=specialistfix'});
await new Promise(r=>setTimeout(r,3500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G;const hits=[];for(const o of G.OPERATORS){if(o.cls!=='特种'||o.sub==='炼金师')continue;const sk=o.skill;if(!sk)continue;if(sk.type==='heal'||/治疗|回复|恢复|自愈|吸血/.test(sk.desc||'')||sk.heal||sk.selfHeal)hits.push({name:o.name,sub:o.sub,type:sk.type,desc:sk.desc});}return JSON.stringify({count:hits.length,hits})})()`));
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G;return JSON.stringify({ascln:G.OP_BY_ID.get('char_4132_ascln').skill,jie:G.OP_BY_ID.get('char_272_strong').skill})})()`));
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,id='char_4132_ascln';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');b._spawnEnemy({type:'boss',wave:1,boss:true,lane:0,bossKey:'boss_skulsr'});const a=b.allies[0],e=b.enemies[0];e.x=a.x;e.hp=e.maxHp=100000;const before=e.hp;b._castSkill(a);return JSON.stringify({damage:Math.round(before-e.hp),castUntil:a.castUntil})})()`));
process.exit(0);
