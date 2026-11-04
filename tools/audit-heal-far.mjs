import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const b=__RHODES__.battle;const m=b.allies.find(x=>x.heal);if(!m)return JSON.stringify({error:'no medic'});b.allies.forEach((x,i)=>{x.x=10+i*18;x.hp=x.maxHp*(i===4?0.2:0.95);});const t=b._lowestAlly(m);return JSON.stringify({med:m.id,target:t.id,ratio:+(t.hp/t.maxHp).toFixed(2),distance:Math.abs(t.x-m.x),healRange:m.range})})()`));
process.exit(0);
