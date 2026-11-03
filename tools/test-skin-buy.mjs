import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await evalJS(send, `__RHODES__.state.primes=100; __RHODES__.G.saveNow(); document.querySelector('[data-nav="skins"]').click(); true`);
await new Promise(r => setTimeout(r, 600));
console.log('disabled', await evalJS(send, `document.querySelector('.gallery-info .btn')?.disabled`));
await evalJS(send, `document.querySelector('.gallery-info .btn')?.click(); true`);
await new Promise(r => setTimeout(r, 600));
console.log(await evalJS(send, `JSON.stringify({owned:Object.keys(__RHODES__.state.skins.owned).length,primes:__RHODES__.state.primes,errs:window.__errs})`));
process.exit(0);
