import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=removepower'});
await new Promise(r=>setTimeout(r,3500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); }
await evalJS(send, `__RHODES__.setView('base',true)`);
await new Promise(r=>setTimeout(r,300));
console.log(await evalJS(send, `JSON.stringify({has:document.body.innerText.includes('全基升 1 级战力'),has2:document.body.innerText.includes('全基升')})`));
process.exit(0);
