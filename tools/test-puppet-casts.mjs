import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const id='char_369_bena';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const body=b.allies[0];b._damageAlly(body,body.maxHp+1000);let casts=0;const orig=b._castSkill.bind(b);b._castSkill=function(a){if(a.puppet)casts++;return orig(a)};for(let i=0;i<201;i++)b._updateAllies(.1);return JSON.stringify({casts,puppet:!!b.allies[0].puppet,dead:b.allies[0].dead,maxSp:b.allies[0].maxSp})})()`));
process.exit(0);
