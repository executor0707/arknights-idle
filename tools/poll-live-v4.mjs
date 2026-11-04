import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'about:blank'});
await new Promise(r=>setTimeout(r,300));
await send('Page.navigate',{url:'https://executor0707.github.io/arknights-idle/v4/?v=freshlive3'});
for (let i=0;i<5;i++) {
  await new Promise(r=>setTimeout(r,2000));
  console.log(i, await evalJS(send, `JSON.stringify({rhodes:typeof window.__RHODES__,label:document.querySelector('#enterLabel')?.textContent,ready:document.readyState,err:window.__err||null})`));
}
process.exit(0);
