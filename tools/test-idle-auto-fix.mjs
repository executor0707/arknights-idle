import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=autoidlefix'});
await new Promise(r=>setTimeout(r,3500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;s.stage.auto=false;window.__IDLE_START__=s.orundum;window.__IDLE_SEC__=s.idle.seconds;return JSON.stringify({auto:s.stage.auto,orundum:s.orundum})})()`));
await new Promise(r=>setTimeout(r,4000));
console.log(await evalJS(send, `JSON.stringify({orundum:__RHODES__.state.orundum,delta:__RHODES__.state.orundum-__IDLE_START__,idleDelta:__RHODES__.state.idle.seconds-__IDLE_SEC__,auto:__RHODES__.state.stage.auto})`));
process.exit(0);
