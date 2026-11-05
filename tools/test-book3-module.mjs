import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=book3module'});
await new Promise(r=>setTimeout(r,3800));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const rooms=['control','trade','factory','power','reception','workshop','training','dorm'];for(const id of rooms){s.base.rooms[id].level=1;s.base.rooms[id].damaged=false;}s.base.rooms.workshop.level=11;s.base.rooms.training.level=11;const before={b3:G.itemCount('book3'),mod:G.itemCount('module'),b1:G.itemCount('book1'),b2:G.itemCount('book2')};G.tickBase(3600,{offline:true});const after={b3:G.itemCount('book3'),mod:G.itemCount('module'),b1:G.itemCount('book1'),b2:G.itemCount('book2')};return JSON.stringify({rates:{workshop:G.roomRate('workshop')*3600,training:G.roomRate('training')*3600},before,after,deltas:{b3:after.b3-before.b3,mod:after.mod-before.mod,b1:after.b1-before.b1,b2:after.b2-before.b2}})})()`));
await evalJS(send, `__RHODES__.setView('base',true)`);
await new Promise(r=>setTimeout(r,300));
console.log(await evalJS(send, `JSON.stringify({book3:document.body.innerText.includes('技巧概要·卷三'),module:document.body.innerText.includes('模组数据块')})`));
process.exit(0);
