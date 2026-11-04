import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=orundumlabel'});
await new Promise(r=>setTimeout(r,1500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `JSON.stringify({cards:[...document.querySelectorAll('.stage-power')].map(x=>x.textContent.trim()),detail:[...document.querySelectorAll('.kv')].filter(x=>x.textContent.includes('挂机合成玉')).map(x=>x.textContent.trim()),pullLabels:[...document.querySelectorAll('body *')].filter(x=>x.children.length===0&&/抽\\/h/.test(x.textContent)).map(x=>x.textContent.trim()).slice(0,10)})`));
process.exit(0);
