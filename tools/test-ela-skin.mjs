import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=ela'});
await new Promise(r=>setTimeout(r,1200));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) {
  await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
  await new Promise(r=>setTimeout(r,1400));
  await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
  await new Promise(r=>setTimeout(r,400));
}
await evalJS(send, `(()=>{const s=__RHODES__.state;s.operators.ela={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.operators.fang={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.skins.owned['ela-skin1']=true;s.skins.equipped.ela='skin1';s.squad=['ela','fang',null,null,null];__RHODES__.setView('battle',true);__RHODES__.battle.start('CE-6');return true})()`);
await new Promise(r=>setTimeout(r,3500));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const out=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))out.push({k,anim:v._anim,h:Math.round(v.height),w:Math.round(v.width)});return JSON.stringify({ops:fr?.ops?Object.keys(fr.ops).filter(x=>x.includes('ela')):[],sprites:out,err:fr?.__frameErr||null})})()`));
await screenshot(send,'.cache/ela-skin.png',1440,1000);
process.exit(0);
