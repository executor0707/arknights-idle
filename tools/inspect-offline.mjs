import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify([...document.querySelectorAll('.offline-modal button, .offline-modal .btn')].map(x=>[x.className,x.innerText]))`));
process.exit(0);
