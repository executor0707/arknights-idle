import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;s.operators.ela={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.squad=['ela','fang',null,null,null];__RHODES__.battle.start('CE-6');const b=__RHODES__.battle,a=b.allies.find(x=>x.id==='ela');const mk=dx=>({uid:'t'+dx,dead:false,lane:a.lane,x:a.x+dx,hp:100});b.enemies=[mk(50)];const h50=b._targetFor(a)?.uid||null;b.enemies=[mk(70)];const h70=b._targetFor(a)?.uid||null;return JSON.stringify({range:a.range,block:a.block,hit50:h50,hit70:h70})})()`));
process.exit(0);
