import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setBlockedURLs',{urls:['*prts.wiki*']});
await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'https://executor0707.github.io/arknights-idle/v4/?v=localonline'});
await new Promise(r=>setTimeout(r,12000));
console.log('page', await evalJS(send, `JSON.stringify({url:location.href,title:document.title,enter:document.querySelector('#enterLabel')?.textContent})`));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) {
  await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
  await new Promise(r=>setTimeout(r,1800));
  await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
  await new Promise(r=>setTimeout(r,400));
}
await evalJS(send, `(()=>{const s=__RHODES__.state;const eq={'char_271_spikes':'skin1','char_4071_peper':'skin1','char_136_hsguma':'skin1'};for(const [id,key] of Object.entries(eq)){s.operators[id]={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.skins.owned[id+'-'+key]=true;s.skins.equipped[id]=key;}s.operators.fang={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.squad=[...Object.keys(eq),'fang',null];__RHODES__.setView('battle',true);__RHODES__.battle.start('CE-6');return true})()`);
await new Promise(r=>setTimeout(r,4000));
console.log('skins', await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const out=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))out.push({k,anim:v._anim,h:Math.round(v.height)});return JSON.stringify(out)})()`));
process.exit(0);
