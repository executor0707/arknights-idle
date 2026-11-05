import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=bard8325'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,400)); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const bards=['char_101_sora','char_4045_heidi','char_4134_cetsyr','char_4184_dolris','skadi_alter'];for(const id of bards)s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};const atk=bards.map(id=>G.getOpStats(id).atk);const b=__RHODES__.battle;s.squad=bards;__RHODES__.setView('battle',true);b.start('CE-6');b._spawnEnemy({type:'boss',wave:1,boss:true,lane:0,bossKey:'boss_skulsr'});const e=b.enemies[0];b._castSkill(b.allies[0]);const one=e.stun;b._castSkill(b.allies[1]);const two=e.stun;e.stun=0;b.bardPulseT=0;b._updateBardChorus(.01);const pulse=e.stun;return JSON.stringify({chorus:Math.round(atk.reduce((a,x)=>a+x*.8325,0)),one,two,pulse})})()`));
process.exit(0);
