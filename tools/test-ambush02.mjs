import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=ambush02'});
await new Promise(r=>setTimeout(r,3800));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,id='char_4186_tmoris';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const a=b.allies[0];a.x=50;for(let i=0;i<3;i++)b._spawnEnemy({type:'soldier',wave:1,boss:false,lane:0,bossKey:null});const es=b.enemies.slice(0,3);es.forEach((e,i)=>{e.x=50+i*2;e.lane=0;e.hp=9999;e.maxHp=9999;});b._attack(a,es[0]);return JSON.stringify({stuns:es.map(e=>e.stun),talent:__RHODES__.G.talentText(id)})})()`));
process.exit(0);
