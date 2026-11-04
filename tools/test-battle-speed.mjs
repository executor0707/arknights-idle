import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=speed'});
await new Promise(r=>setTimeout(r,1200));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) {
  await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
  await new Promise(r=>setTimeout(r,1400));
  await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
  await new Promise(r=>setTimeout(r,400));
}
await evalJS(send, `(()=>{const s=__RHODES__.state;s.operators.amiya={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.operators.char_4124_iana={level:1,elite:0,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.squad=['amiya','char_4124_iana',null,null,null];__RHODES__.setView('battle',true);__RHODES__.battle.start('CE-6');__RHODES__.battle.setSpeed(2);return true})()`);
await new Promise(r=>setTimeout(r,1200));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const out=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))out.push({k,timeScale:v.state.timeScale,anim:v._anim});return JSON.stringify(out)})()`));
console.log('35', await evalJS(send, `(()=>{const s=__RHODES__.battle;return JSON.stringify({speed:__RHODES__.state.stage.speed})})()`));
process.exit(0);
