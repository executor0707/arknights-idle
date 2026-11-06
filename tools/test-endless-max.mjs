import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;s.stage.selected='CE-6';s.orundum=0;G.tickIdle(3600);const oneHour=s.orundum;const st=G.ensureEndlessFloor(40000);return JSON.stringify({idlePerHour:oneHour,max:G.MAX_ENDLESS_FLOOR,floor:st.floor,display:st.name,code:st.code,rec:st.rec,raw:st.idle.orundumPerHour,adjusted:G.stageIdleRates(st).orundumPerHour})})()`));
process.exit(0);
