import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await evalJS(send, `document.querySelector('[data-action="close-modal"]')?.click();__RHODES__.setView('skins',true);true`);
await new Promise(r=>setTimeout(r,700));
console.log(await evalJS(send, `JSON.stringify({buttons:[...document.querySelectorAll('.gallery-card .btn')].slice(0,12).map(x=>x.textContent),filter:document.querySelector('[data-action="skin-owned"]')?.textContent,owned:document.querySelectorAll('.gallery-card.owned').length})`));
process.exit(0);
