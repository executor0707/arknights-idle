import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=leveling'});
await new Promise(r=>setTimeout(r,1200));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) {
  await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
  await new Promise(r=>setTimeout(r,1400));
  await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
  await new Promise(r=>setTimeout(r,400));
}
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const G=__RHODES__.G;const id='amiya';s.operators[id]={level:50,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};const e0=G.getOpStats(id);s.lmd=9999999;s.inventory.chip=999;s.inventory.chip_pack=999;const beforePromo=G.promotionInfo(id);const ok=G.promote(id);const afterPromo={level:s.operators[id].level,elite:s.operators[id].elite};s.operators[id].level=70;const e1max=G.getOpStats(id);const promo2=G.promotionInfo(id);const ok2=G.promote(id);const after2={level:s.operators[id].level,elite:s.operators[id].elite};const e2l1=G.getOpStats(id);s.operators[id].level=90;const e2max=G.getOpStats(id);return JSON.stringify({e0maxAtk:Math.round(e0.atk),e0maxHp:Math.round(e0.hp),beforePromo,ok,afterPromo,e1maxAtk:Math.round(e1max.atk),e1maxHp:Math.round(e1max.hp),promo2,ok2,after2,e2l1Atk:Math.round(e2l1.atk),e2l1Hp:Math.round(e2l1.hp),e2maxAtk:Math.round(e2max.atk),e2maxHp:Math.round(e2max.hp),capE2:G.levelCap(5,2)})})()`));
process.exit(0);
