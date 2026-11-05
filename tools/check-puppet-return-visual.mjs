import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await evalJS(send, `(()=>{const s=__RHODES__.state,id='char_4183_mortis';s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.skins.owned['char_4183_mortis-skin1']=true;s.skins.equipped[id]='skin1';s.squad=[id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const body=b.allies[0];b._damageAlly(body,body.maxHp+1000);const sub=b.allies[0];sub.puppetElapsed=sub.puppetDuration;b._updateAllies(.1);return 'returned'})()`);
await new Promise(r=>setTimeout(r,900));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const out=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))out.push({anim:v._anim,puppet:v._puppetActive});return JSON.stringify(out)})()`));
process.exit(0);
