import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/head-inspect.html?v=1'});
await new Promise(r=>setTimeout(r,5000));
console.log(await evalJS(send, `document.body.innerText.slice(0,16000)`));
process.exit(0);
