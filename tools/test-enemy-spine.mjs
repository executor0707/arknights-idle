import { connect, screenshot, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:700,height:500,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/enemy-spine-test.html'});
await new Promise(r=>setTimeout(r,3000));
console.log(await evalJS(send,`JSON.stringify({ok:window.__enemyOK,err:window.__enemyErr})`));
await screenshot(send,'.cache/enemy-spine-test.png',700,500);
process.exit(0);
