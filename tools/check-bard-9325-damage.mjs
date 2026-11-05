import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const b=__RHODES__.battle;b._spawnEnemy({type:'boss',wave:1,boss:true,lane:0,bossKey:'boss_skulsr'});b.baseBonuses.crit=0;b.bardPulseT=0;const vals=[];b._damageEnemy=function(e,a,o){vals.push(+a.toFixed(2))};b._updateBardChorus(1);const a=b.allies[0];return JSON.stringify({expected:+(a.atk*.9325+a.maxHp*.01).toFixed(2),actual:vals})})()`));
process.exit(0);
