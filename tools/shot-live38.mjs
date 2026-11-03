import { connect, screenshot, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `document.querySelector('[data-action="close-modal"]')?.innerText`));
await evalJS(send, `document.querySelector('[data-action="close-modal"]')?.click(); true`);
await new Promise(r => setTimeout(r, 2000));
console.log(await evalJS(send, `JSON.stringify({canvas38:!!document.querySelector('.spine38-canvas'),spineUnits:document.querySelectorAll('.ally-token.spine-unit').length,enemy:document.querySelectorAll('.enemy-token.spine-unit').length})`));
await screenshot(send, 'qa/v2-live-38.png', 1920, 1080);
process.exit(0);
