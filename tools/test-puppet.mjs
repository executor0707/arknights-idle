import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=puppet'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2500)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,400)); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state,id='char_369_bena';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};const st=G.getOpStats(id);return JSON.stringify({puppeteer:st.puppeteer,talent:G.talentText('char_369_bena'),puppetSkill:G.puppetSkillText('char_369_bena')})})()`));
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const id='char_369_bena';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const body=b.allies[0];b._damageAlly(body,body.maxHp+1000);const sub=b.allies[0];return JSON.stringify({bodyDead:body.dead,puppet:sub.puppet,puppetId:sub.id,maxSp:sub.maxSp,spRate:sub.spRate,block:sub.block,skill:sub.puppetSkill?.name,bodyDeadAgain:body.dead})})()`));
await new Promise(r=>setTimeout(r,600));
console.log(await evalJS(send, `(()=>{const bar=document.querySelector('.ally-token .puppetbar');const i=bar?.querySelector('i');return JSON.stringify({bar:!!bar,hidden:bar?.classList.contains('hidden'),width:i?.style.width,puppetClass:document.querySelector('.ally-token')?.classList.contains('puppet')})})()`));
console.log(await evalJS(send, `(()=>{const b=__RHODES__.battle;const sub=b.allies[0];for(let i=0;i<201;i++)b._updateAllies(.1);return JSON.stringify({puppet:!!b.allies[0].puppet,dead:b.allies[0].dead,id:b.allies[0].id,hp:Math.round(b.allies[0].hp)})})()`));
process.exit(0);
