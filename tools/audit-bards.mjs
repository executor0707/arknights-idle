import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const saved=JSON.parse(JSON.stringify(s.operators));const out=[];for(const o of __RHODES__.G.OPERATORS.filter(o=>o.sub==='吟游者')){if(!s.operators[o.id])s.operators[o.id]={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};const st=__RHODES__.G.getOpStats(o.id);out.push({name:o.name,range:st.range,block:st.block,bard:st.bard,heal:st.heal});}s.operators=saved;return JSON.stringify(out)})()`));
process.exit(0);
