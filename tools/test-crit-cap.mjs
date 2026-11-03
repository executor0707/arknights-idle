import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
console.log(await evalJS(send, `(()=>{const st=__RHODES__.state;st.base.rooms.control.level=1900;__RHODES__.setView('base',true);const b=__RHODES__.G.getBaseBonuses();return JSON.stringify({crit:b.crit,can:__RHODES__.G.canUpgradeRoom('control'),buttons:[...document.querySelectorAll('.room-card')].slice(0,1).map(x=>x.querySelector('button')?.textContent)})})()`));
process.exit(0);
