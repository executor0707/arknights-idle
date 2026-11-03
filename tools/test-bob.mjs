import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
const a = await evalJS(send, `document.querySelector('.ally-token')?.style.top`);
await new Promise(r => setTimeout(r, 300));
const b = await evalJS(send, `document.querySelector('.ally-token')?.style.top`);
console.log(JSON.stringify({ a, b, changed: a !== b }));
process.exit(0);
