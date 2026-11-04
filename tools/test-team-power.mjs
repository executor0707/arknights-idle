import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const ids=['char_225_haak','char_4132_ascln','ela','char_4009_irene','eyjafjalla'];for(const id of ids){s.operators[id]={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};}s.squad=[...ids];const rows=[];for(let lv=1;lv<=50;lv+=5){for(const id of ids)s.operators[id].level=lv;rows.push({lv,power:G.squadPower()});}return JSON.stringify(rows)})()`));
process.exit(0);
