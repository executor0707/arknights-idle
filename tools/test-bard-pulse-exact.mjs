import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const b=__RHODES__.battle;__RHODES__.setView('battle',true);b.start('CE-6');b._spawnEnemy({type:'soldier',wave:1,boss:false,lane:0,bossKey:null});const e=b.enemies[0];const before=e.hp;b.bardPulseT=0;b._updateBardChorus(0.01);return JSON.stringify({before:Math.round(before),after:Math.round(e.hp),stun:+e.stun.toFixed(2),bards:b.allies.filter(a=>a.bard).length})})()`));
process.exit(0);
