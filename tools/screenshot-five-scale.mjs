import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await send('Runtime.enable');
await evalJS(send, `(()=>{const s=__RHODES__.state;const list=[['char_1001_amiya2','skin1',1.25],['char_4009_irene','skin1',1.0],['char_4132_ascln','skin1',1.1],['char_291_aglina','skin1',0.9],['char_4178_alanna','skin1',1.3]];for(const [id,k,sc] of list){s.skins.owned[id+'-'+k]=true;s.skins.equipped[id]=k;s.skins.scale[id+'-'+k]=sc;}s.squad=list.map(x=>x[0]);s.settings.characterScale=1.5;__RHODES__.setView('battle',true);return true})()`);
await new Promise(r=>setTimeout(r,2400));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const arr=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))arr.push({k,ratio:+(v.scale.x/v._baseScale).toFixed(3),h:Math.round(v.height)});return JSON.stringify({iframe:!!f,sp:arr})})()`));
await screenshot(send,'.cache/five-skins-scale-battle.png',1440,1000);
process.exit(0);
