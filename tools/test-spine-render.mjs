import { connect, screenshot, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1000,height:600,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/spine-test.html'});
await new Promise(r=>setTimeout(r,3500));
console.log(await evalJS(send,`JSON.stringify({ok:window.__spineOK,err:window.__spineErr,canvas:!!document.querySelector('canvas')})`));
await screenshot(send,'.cache/spine-test.png',1000,600);
process.exit(0);
