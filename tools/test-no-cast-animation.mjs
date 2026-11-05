import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=nocast'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,id='mlynar';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');b._spawnEnemy({type:'boss',wave:1,boss:true,lane:0,bossKey:'boss_skulsr'});const a=b.allies[0];const e=b.enemies[0];e.x=a.x;e.hp=e.maxHp=1000000;const before=e.hp;b._castSkill(a);return JSON.stringify({castUntil:a.castUntil,cast:b.cast,cutIn:b.cutIn,damage:Math.round(before-e.hp),sp:a.sp})})()`));
await new Promise(r=>setTimeout(r,400));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const sp=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))sp.push({anim:v._anim,cast:v._castMark});return JSON.stringify({sp,cutin:!!document.querySelector('#skillCutin:not(.hidden)')})})()`));
process.exit(0);
