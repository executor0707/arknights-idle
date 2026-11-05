import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const bards=['char_101_sora','char_4045_heidi','char_4134_cetsyr','char_4184_dolris','skadi_alter'];for(const id of bards)s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=bards;__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');for(const a of b.allies)a.sp=a.maxSp;b.tick(.1);return 'started'})()`));
await new Promise(r=>setTimeout(r,900));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const out=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))out.push({k,anim:v._anim,bard:v._bard});return JSON.stringify({err:fr?.__frameErr||null,out})})()`));
process.exit(0);
