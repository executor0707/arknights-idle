import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{
 const b=__RHODES__.battle;const m=b.allies.find(a=>a.heal);const t=b.allies.find(a=>a!==m);
 const low=b._lowestAlly(m);
 const before=t.hp;t.hp=Math.max(1,t.maxHp*0.2);
 const low2=b._lowestAlly(m);
 b._healAlly(low2,500,m);
 return JSON.stringify({medic:m?.id,heal:m?.heal,atk:m?.atk,cooldown:m?.cooldown,low:low?.id,low2:low2?.id,target:t.id,before,after:t.hp,max:t.maxHp,all:b.allies.map(a=>({id:a.id,hp:Math.round(a.hp),max:a.maxHp,heal:a.heal}))});
})()`));
process.exit(0);
