import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await evalJS(send, `document.querySelector('[data-action="toggle-deploy"]')?.click(); true`);
await new Promise(r => setTimeout(r, 300));
await evalJS(send, `document.querySelector('.ally-token')?.click(); true`);
await new Promise(r => setTimeout(r, 500));
console.log(await evalJS(send, `JSON.stringify((()=>{const u=__RHODES__.battle.allies[0];const st=u&&__RHODES__.G.getOpStats(u.id);const cells=[...document.querySelectorAll('.deploy-cell')];return {id:u?.id,x:u?.x,y:u?.y,range:st?.range,cls:cells.map(c=>c.className),ring:document.querySelectorAll('.range-ring.selected').length}})())`));
process.exit(0);
