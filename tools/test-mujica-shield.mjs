import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=mujicashield'});
await new Promise(r=>setTimeout(r,3800));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const m=['char_4182_oblvns','char_4183_mortis','char_4184_dolris','char_4186_tmoris','char_4185_amoris'];for(const id of m)s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=m;__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const a=b.allies[0];a.hp=a.maxHp*.4;const before=Math.round(a.hp);b._spawnEnemy({type:'soldier',wave:1,boss:false,lane:0,bossKey:null});b.mujicaT=0;b._updateMujica(.1);return JSON.stringify({maxHp:Math.round(a.maxHp),hpBefore:before,hpAfter:Math.round(a.hp),shield:Math.round(a.shield),shieldPct:+(a.shield/a.maxHp*100).toFixed(1),shieldT:+a.shieldT.toFixed(1)})})()`));
process.exit(0);
