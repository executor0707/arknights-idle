import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html?v=fix2'});
await new Promise(r=>setTimeout(r,1000));
await evalJS(send,`localStorage.clear();location.reload();true`);
await new Promise(r=>setTimeout(r,1000));
await evalJS(send,`document.getElementById('enterBtn').click();true`);
await new Promise(r=>setTimeout(r,1600));
await evalJS(send,`document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
await new Promise(r=>setTimeout(r,1200));
// doctor: force XP and check cap/reward
console.log('doctor0', await evalJS(send,`JSON.stringify({level:__RHODES__.state.doctor.level,primes:__RHODES__.state.primes,today:__RHODES__.state.doctor.todayLevels,need:__RHODES__.G.doctorExpNeeded(1)})`));
await evalJS(send,`__RHODES__.state.doctor.level=1;__RHODES__.state.doctor.exp=0;__RHODES__.state.doctor.todayLevels=0;__RHODES__.state.primes=0;const u=__RHODES__.G.addDoctorExp(999999);window.__doctorUps=u;true`);
console.log('doctor1', await evalJS(send,`JSON.stringify({ups:window.__doctorUps,level:__RHODES__.state.doctor.level,primes:__RHODES__.state.primes,today:__RHODES__.state.doctor.todayLevels,exp:__RHODES__.state.doctor.exp})`));
// deployment via token + arena click
await evalJS(send,`__RHODES__.setView&&__RHODES__.setView('battle',true);true`);
await new Promise(r=>setTimeout(r,400));
await evalJS(send,`document.querySelector('.ally-token')?.click();true`);
await new Promise(r=>setTimeout(r,300));
console.log('deploy1', await evalJS(send,`JSON.stringify({deploying:!!document.querySelector('.range-ring.selected'),rings:document.querySelectorAll('.range-ring').length})`));
await evalJS(send,`(()=>{const a=document.querySelector('#arena');const r=a.getBoundingClientRect();a.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+r.width*0.52,clientY:r.top+r.height*0.5}));return true})()`);
await new Promise(r=>setTimeout(r,500));
console.log('deploy2', await evalJS(send,`JSON.stringify({deploy:__RHODES__.state.deploy,pos:__RHODES__.battle.allies[0]&&[__RHODES__.battle.allies[0].x,__RHODES__.battle.allies[0].y],errs:window.__errs})`));
// 12 unit sizing
const ids=await evalJS(send,`JSON.stringify(__RHODES__.G.OPERATORS.slice(0,12).map(o=>o.id))`);
await evalJS(send,`__RHODES__.state.squad=[...JSON.parse(${JSON.stringify(ids)})];__RHODES__.ensureOp&&JSON.parse(${JSON.stringify(ids)}).forEach(id=>__RHODES__.ensureOp(id));__RHODES__.battle.start();true`);
await new Promise(r=>setTimeout(r,1600));
console.log('12', await evalJS(send,`JSON.stringify({allies:__RHODES__.battle.allies.length,spine:document.querySelectorAll('.ally-token.spine-unit').length})`));
await screenshot(send,'.cache/fix-12.png',1440,1000);
process.exit(0);
