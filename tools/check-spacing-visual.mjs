import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;s.settings.formationSpacing=2;__RHODES__.setView('battle',true);return JSON.stringify({allies:__RHODES__.battle.allies.length,actual:__RHODES__.battle.allies.map(a=>a.x)})})()`));
await new Promise(r=>setTimeout(r,900));
console.log(await evalJS(send, `JSON.stringify({left:[...document.querySelectorAll('.ally-token')].map(x=>x.style.left),count:document.querySelectorAll('.ally-token').length,setting:__RHODES__.state.settings.formationSpacing})`));
process.exit(0);
