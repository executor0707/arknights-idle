import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=bardskins'});
await new Promise(r=>setTimeout(r,1600));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log('data', await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;return JSON.stringify({skins:G.SKINS.length,sora:G.skinsFor('char_101_sora').map(x=>x.id),equipped:'skin2',removedBard:G.REMOVED_SKIN_IDS?[...G.REMOVED_SKIN_IDS].filter(x=>/sora|heidi|cetsyr|dolris|ulika|skadi_alter/.test(x)):null})})()`));
console.log('battle', await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const id='char_101_sora';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.skins.owned['char_101_sora-skin2']=true;s.skins.equipped[id]='skin2';s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');return JSON.stringify({bard:b.allies[0]?.bard,role:b.allies[0]?.role,stage:b.stage?.id})})()`));
await new Promise(r=>setTimeout(r,2500));
console.log('frame', await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;return JSON.stringify({frame:!!fr,sprites:fr?.sprites?[...fr.sprites.entries()].filter(([k])=>k.startsWith('a:')).map(([k,v])=>({k,anim:v._anim,h:Math.round(v.height)})):[],err:fr?.__frameErr||null})})()`));
process.exit(0);
