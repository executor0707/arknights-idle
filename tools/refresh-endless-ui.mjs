import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify({before:document.querySelector('.stage-card')?.textContent,selected:__RHODES__.state.stage.selected})`));
console.log(await evalJS(send, `__RHODES__.setView('battle',true);true`));
await new Promise(r=>setTimeout(r,500));
console.log(await evalJS(send, `JSON.stringify({after:document.querySelector('.stage-card')?.textContent,selected:__RHODES__.state.stage.selected})`));
process.exit(0);
