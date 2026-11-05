import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=pity50'});
await new Promise(r=>setTimeout(r,3500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;s.orundum=1e8;s.gacha.standard.since6=49;const r=G.pull('standard',1);return JSON.stringify({rarity:r.results[0].rarity,name:r.results[0].op.name,since6:s.gacha.standard.since6})})()`));
await evalJS(send, `__RHODES__.setView('gacha',true)`);
await new Promise(r=>setTimeout(r,300));
console.log(await evalJS(send, `(()=>{const t=document.body.innerText;return JSON.stringify({hard50:t.includes('第 50 抽为硬保底'),dist50:t.includes('距离50抽保底'),noRate:t.includes('等概率随机')})})()`));
process.exit(0);
