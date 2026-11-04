import { connect, evalJS } from './cdp.mjs';
const {send}=await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/'});
await new Promise(r=>setTimeout(r,1000));
await evalJS(send, `window.__RHODES_IMPORTING__=true;localStorage.clear();location.reload();true`);
await new Promise(r=>setTimeout(r,1200));
console.log('clean', await evalJS(send, `JSON.stringify({key:localStorage.getItem('rhodes_island_idle_save_v3')?'yes':'no',label:document.querySelector('#enterLabel')?.textContent,resetHidden:document.querySelector('#splashReset')?.classList.contains('hidden')})`));
// Close/reload the splash without entering; must not create a save.
await send('Page.reload',{ignoreCache:true});
await new Promise(r=>setTimeout(r,1200));
console.log('splashReload', await evalJS(send, `JSON.stringify({key:localStorage.getItem('rhodes_island_idle_save_v3')?'yes':'no',label:document.querySelector('#enterLabel')?.textContent})`));
// Enter, then normal refresh must continue.
await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
await new Promise(r=>setTimeout(r,1400));
await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
await new Promise(r=>setTimeout(r,800));
console.log('played', await evalJS(send, `JSON.stringify({key:localStorage.getItem('rhodes_island_idle_save_v3')?'yes':'no',ops:Object.keys(__RHODES__?.state?.operators||{}).length})`));
await send('Page.reload',{ignoreCache:true});
await new Promise(r=>setTimeout(r,1200));
console.log('afterPlayRefresh', await evalJS(send, `JSON.stringify({key:localStorage.getItem('rhodes_island_idle_save_v3')?'yes':'no',label:document.querySelector('#enterLabel')?.textContent})`));
process.exit(0);
