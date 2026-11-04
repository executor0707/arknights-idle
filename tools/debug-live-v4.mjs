import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'https://executor0707.github.io/arknights-idle/v4/?v=debuglive'});
await new Promise(r=>setTimeout(r,2500));
console.log('before',await evalJS(send,`JSON.stringify({rhodes:!!window.__RHODES__,label:document.querySelector('#enterLabel')?.textContent,scripts:[...document.scripts].map(s=>s.src)})`));
console.log('import', await evalJS(send, `import('./js10/main.js?v=debug').then(()=> 'ok').catch(e=>String(e.stack||e))`, true));
process.exit(0);
