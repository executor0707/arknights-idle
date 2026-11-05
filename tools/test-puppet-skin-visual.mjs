import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=puppetskin'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
for (const [id, skin] of [['char_369_bena','char_369_bena-skin1'],['char_4183_mortis','char_4183_mortis-skin1'],['char_4217_makoto','char_4217_makoto-skin1']]) {
  await evalJS(send, `(()=>{const s=__RHODES__.state;s.operators['${id}']={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.skins.owned['${skin}']=true;s.skins.equipped['${id}']='skin1';s.squad=['${id}',null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const body=b.allies[0];b._damageAlly(body,body.maxHp+1000);return 'ok'})()`);
  await new Promise(r=>setTimeout(r,1500));
  console.log(id, await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const out=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))out.push({k,anim:v._anim,puppet:v._puppetActive,error:fr.__frameErr||null});return JSON.stringify(out)})()`));
}
process.exit(0);
