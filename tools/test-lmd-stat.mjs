import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=lmdstat'});
await new Promise(r=>setTimeout(r,1500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `JSON.stringify({stats:[...document.querySelectorAll('.mini-stat')].map(x=>[x.querySelector('span')?.textContent,x.querySelector('b')?.textContent]),cols:getComputedStyle(document.querySelector('.mini-stat-row')).gridTemplateColumns})`));
await screenshot(send,'.cache/lmd-stat.png',1440,1000);
process.exit(0);
