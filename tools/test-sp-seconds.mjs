import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state,id='char_4230_mcnist';s.operators[id]={level:90,elite:2,potential:1,skill:1,mastery:0,trust:0,module:0,exp:0};s.squad=[id,null,null,null,null];s.settings.autoSkill=true;__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');b.enemies=[];b.spawnQueue=[];const a=b.allies[0];a.sp=0;for(let t=0;t<33.9;t+=0.1)b._updateAllies(0.1);const before=a.sp;b._updateAllies(0.2);return JSON.stringify({maxSp:a.maxSp,at33_9:+before.toFixed(2),after34_1:+a.sp.toFixed(2),skill:G.OP_BY_ID.get(id).skill.name})})()`));
process.exit(0);
