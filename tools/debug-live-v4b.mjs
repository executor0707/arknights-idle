import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'https://executor0707.github.io/arknights-idle/v4/?v=debuglive2'});
await new Promise(r=>setTimeout(r,2000));
console.log(await evalJS(send, `JSON.stringify({base:document.baseURI,label:document.querySelector('#enterLabel')?.textContent,scripts:[...document.scripts].map(s=>s.src),rhodes:!!window.__RHODES__})`));
console.log(await evalJS(send, `import('/arknights-idle/v4/js10/main.js?v=debug2').then(()=> 'ok').catch(e=>String(e.stack||e))`, true));
process.exit(0);
