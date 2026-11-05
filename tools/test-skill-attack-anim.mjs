import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=skillattack'});
await new Promise(r=>setTimeout(r,1600));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;for(const [id,sk] of [['mlynar','skin1'],['char_426_billro','skin1']]){s.operators[id]={level:90,elite:2,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.skins.owned[id+'-'+sk]=true;s.skins.equipped[id]=sk;}s.squad=['mlynar','char_426_billro',null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');for(const a of b.allies){a.attackLock=1;}return JSON.stringify({skins:G.SKINS.length,allies:b.allies.map(a=>a.id)})})()`));
await new Promise(r=>setTimeout(r,850));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const out=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))out.push({k,anim:v._anim,clip:v._attackClipName,skillAttack:v._skillAttack});return JSON.stringify({out,err:fr?.__frameErr||null})})()`));
process.exit(0);
