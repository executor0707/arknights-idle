import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=sp32'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,400)); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const O=G.OPERATORS;const vals=O.map(o=>o.skill?.sp);return JSON.stringify({total:O.length,missing:vals.filter(x=>!x).length,min:Math.min(...vals),max:Math.max(...vals),unique:new Set(vals).size,spread:[...new Set(vals)].sort((a,b)=>a-b),bards:['char_101_sora','char_4045_heidi','char_4134_cetsyr','char_4184_dolris','skadi_alter'].map(id=>[id,G.OP_BY_ID.get(id)?.skill?.sp])})})()`));
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,G=__RHODES__.G;const ids=['char_101_sora','char_4045_heidi','char_4134_cetsyr','char_4184_dolris','skadi_alter'];for(const id of ids)s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=ids;__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');return JSON.stringify(b.allies.map(a=>[a.id,a.maxSp]))})()`));
process.exit(0);
