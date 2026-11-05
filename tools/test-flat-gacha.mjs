import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=flatgacha'});
await new Promise(r=>setTimeout(r,3500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;s.orundum=1e12;const out={};for(const id of ['standard','limited','collab']){const counts={};let six=0;for(let i=0;i<10;i++){const r=G.pull(id,100);for(const x of r.results)if(x.rarity===6){six++;counts[x.op.name]=(counts[x.op.name]||0)+1;}}out[id]={six,counts,logos:counts['罗格斯']||0};}return JSON.stringify(out)})()`));
await evalJS(send, `__RHODES__.setView('gacha',true)`);
await new Promise(r=>setTimeout(r,300));
console.log(await evalJS(send, `(()=>{const t=document.body.innerText;return JSON.stringify({noRateUp:!t.includes('RATE UP'),equal:t.includes('等概率随机')})})()`));
process.exit(0);
