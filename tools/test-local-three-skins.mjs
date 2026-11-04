import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setBlockedURLs',{urls:['*prts.wiki*']});
await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=localskins'});
await new Promise(r=>setTimeout(r,1200));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) {
  await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
  await new Promise(r=>setTimeout(r,1400));
  await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
  await new Promise(r=>setTimeout(r,400));
}
await evalJS(send, `(()=>{const s=__RHODES__.state;const eq={'char_271_spikes':'skin1','char_4071_peper':'skin1','char_136_hsguma':'skin1'};const ids=[...Object.keys(eq),'fang'];for(const [id,key] of Object.entries(eq)){s.operators[id]={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};const sk=id+'-'+key;s.skins.owned[sk]=true;s.skins.equipped[id]=key;}s.operators.fang={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.squad=ids.slice(0,5);while(s.squad.length<5)s.squad.push(null);__RHODES__.setView('battle',true);__RHODES__.battle.start('CE-6');return true})()`);
await new Promise(r=>setTimeout(r,3500));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const out=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))out.push({k,anim:v._anim,h:Math.round(v.height),w:Math.round(v.width)});return JSON.stringify({skins:['char_271_spikes-skin1','char_4071_peper-skin1','char_136_hsguma-skin1'],sprites:out,err:fr?.__frameErr||null})})()`));
await screenshot(send,'.cache/local-skins-three.png',1440,1000);
process.exit(0);
