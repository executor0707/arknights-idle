import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
const ids = await evalJS(send, `JSON.stringify(__RHODES__.G.OPERATORS.slice(0,12).map(o=>o.id))`);
await evalJS(send, `(()=>{const ids=JSON.parse(${JSON.stringify(ids)});ids.forEach(id=>{if(!__RHODES__.state.operators[id])__RHODES__.state.operators[id]={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0}});__RHODES__.state.squad=[...ids];__RHODES__.battle.start();return true})()`);
await new Promise(r=>setTimeout(r,2500));
console.log(await evalJS(send, `JSON.stringify({allies:__RHODES__.battle.allies.length,spine:document.querySelectorAll('.ally-token.spine-unit').length,errs:window.__errs})`));
await screenshot(send,'.cache/fix-12.png',1440,1000);
process.exit(0);
