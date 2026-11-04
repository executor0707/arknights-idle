import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await evalJS(send, `__RHODES__.state.stage.auto=true;__RHODES__.battle.start('CE-6');true`);
await new Promise(r=>setTimeout(r,800));
await evalJS(send, `__RHODES__.battle._finish(true,'tail-test');true`);
await new Promise(r=>setTimeout(r,400));
console.log(await evalJS(send, `JSON.stringify({stage:__RHODES__.battle.stage.name,next:__RHODES__.battle.nextStageId,buttons:[...document.querySelectorAll('.result-actions .btn')].map(x=>x.textContent)})`));
process.exit(0);
