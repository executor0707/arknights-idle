import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Runtime.enable');
await evalJS(send, `__RHODES__.battle.start('CE-6');true`);
const base = await evalJS(send, `(()=>{const b=__RHODES__.battle;const e={uid:'leak1',x:5.4,y:64,lane:0,dead:false,boss:false,blockedBy:null,speed:0,stun:0,vulnT:0,slowT:0,hp:100,maxHp:100,atk:1,def:0,res:0,size:1,attackCd:1,attackFlash:0,hitFlash:0};b.enemies.push(e);b._updateEnemies(0.1);return JSON.stringify({leaks:b.leaks,status:b.status,hud:document.querySelector('#leakCount')?.textContent})})()`);
const fail = await evalJS(send, `(()=>{const b=__RHODES__.battle;for(let i=0;i<2;i++){const e={uid:'leak'+(i+2),x:5.4,y:64,lane:0,dead:false,boss:false,blockedBy:null,speed:0,stun:0,vulnT:0,slowT:0,hp:100,maxHp:100,atk:1,def:0,res:0,size:1,attackCd:1,attackFlash:0,hitFlash:0};b.enemies.push(e);b._updateEnemies(0.1)}return JSON.stringify({leaks:b.leaks,status:b.status,end:b.endTimer,next:b.nextStageId})})()`);
const boss = await evalJS(send, `(()=>{const b=__RHODES__.battle;b.start('CE-6');b._spawnEnemy({type:'boss',wave:3,boss:true,bossKey:'boss_skulsr'});const e=b.enemies[b.enemies.length-1];return JSON.stringify({hp:Math.round(e.hp),atk:Math.round(e.atk),bossPower:Math.round(e.bossPower),avg:Math.round(b.stage.rec/5)})})()`);
console.log({base,fail,boss});
process.exit(0);
