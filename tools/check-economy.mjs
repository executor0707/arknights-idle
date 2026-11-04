import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify({maxStage:__RHODES__.G.ensureEndlessFloor(99999).name,powerGain:__RHODES__.G.baseLevelPowerGain(),costs:[1,10,100,1000].map(l=>{const st=__RHODES__.state;const old=st.base.rooms.trade.level;st.base.rooms.trade.level=l;const c=__RHODES__.G.roomUpgradeCost('trade');st.base.rooms.trade.level=old;return [l,c]})})`));
process.exit(0);
