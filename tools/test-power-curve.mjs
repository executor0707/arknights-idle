import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const ids=G.OPERATORS.filter(o=>o.rarity===6).slice(0,10).map(o=>o.id);const rows=[];for(const id of ids){const d=G.OP_BY_ID.get(id);for(const [elite,level] of [[0,1],[0,50],[1,1],[1,80],[2,1],[2,90]]){s.operators[id]={level,elite,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};rows.push({id,name:d.name,elite,level,power:G.opPower(id)});}}return JSON.stringify(rows)})()`));
process.exit(0);
