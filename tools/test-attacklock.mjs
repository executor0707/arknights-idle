import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await evalJS(send, `__RHODES__.setView('battle', true); __RHODES__.battle.start('CE-6'); true`);
const result = await evalJS(send, `(()=>{
 const b=__RHODES__.battle;
 const mk=(hp)=>({uid:'x'+Math.random(),x:40,y:64,lane:0,dead:false,boss:false,blockedBy:null,speed:0,slow:0,stun:0,vulnT:0,slowT:0,burnT:0,hp,maxHp:hp,atk:1,def:0,res:0,size:1,attackCd:1,attackFlash:0,hitFlash:0});
 const low=mk(40), high=mk(400); b.enemies.push(low,high);
 const a=b.allies.find(x=>x.role!=='medic')||b.allies[0];
 a.cooldown=0; a.attackLock=0;
 b._updateAllies(0.1);
 const after={lock:a.attackLock,target:a.lastTarget,lowDead:low.dead,lowHp:low.hp};
 return JSON.stringify({after,targetLow:a.lastTarget===low.uid});
})()`);
console.log(result);
process.exit(0);
