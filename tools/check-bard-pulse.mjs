import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await evalJS(send, `document.querySelector('[data-action="modal-close"]')?.click();true`);
console.log(await evalJS(send, `(()=>{const b=__RHODES__.battle;__RHODES__.setView('battle',true);b.tick(2.5);return JSON.stringify({t:+b.time.toFixed(1),bards:b.allies.filter(a=>a.bard).length,enemies:b.enemies.length,hp:b.enemies.map(e=>Math.round(e.hp)),stun:b.enemies.map(e=>+(e.stun||0).toFixed(2)),pulse:b.bardPulseT})})()`));
process.exit(0);
