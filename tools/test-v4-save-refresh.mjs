import fs from 'node:fs';
import { connect, evalJS } from './cdp.mjs';
const v3 = fs.readFileSync('C:/Users/21023/Desktop/rhodes-idle-max-no-stages-v3-2026-11-04.json','utf8');
const v4 = fs.readFileSync('rhodes-idle-max-no-stages.json','utf8');
const {send}=await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html?v=v4check'});
await new Promise(r=>setTimeout(r,1000));
console.log(await evalJS(send, `(async()=>{const m=await import('./js/save-codec.js');const t=async(v)=>{try{const s=await m.decodeSaveFile(v);return 'OK '+Object.keys(s.operators).length}catch(e){return e.message}};return JSON.stringify({v3:await t(JSON.parse(${JSON.stringify(v3)})),plain:await t({version:1,operators:{x:1}}),v4:await t(JSON.parse(${JSON.stringify(v4)}))})})()`, true));
// Import v4 through the normal file picker path, then reload and ensure the played state persists.
await evalJS(send, `window.__RHODES_IMPORTING__=true;localStorage.clear();location.reload();true`);
await new Promise(r=>setTimeout(r,1200));
await evalJS(send, `(()=>{const i=document.querySelector('#splashImportFile');const d=new DataTransfer();d.items.add(new File([${JSON.stringify(v4)}],'v4.json',{type:'application/json'}));i.files=d.files;i.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
await new Promise(r=>setTimeout(r,1800));
console.log('imported', await evalJS(send, `JSON.stringify({app:!!window.__RHODES__,ops:Object.keys(__RHODES__?.state?.operators||{}).length,importFlag:window.__RHODES_IMPORTING__})`));
await send('Page.reload',{ignoreCache:true});
await new Promise(r=>setTimeout(r,1200));
console.log('afterRefresh', await evalJS(send, `JSON.stringify({has:!!localStorage.getItem('rhodes_island_idle_save_v3'),label:document.querySelector('#enterLabel')?.textContent,importFlag:window.__RHODES_IMPORTING__})`));
process.exit(0);
