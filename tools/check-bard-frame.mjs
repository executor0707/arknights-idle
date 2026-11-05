import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await new Promise(r=>setTimeout(r,800));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const fr=f?.contentWindow?.__frame;const out=[];if(fr?.sprites)for(const [k,v] of fr.sprites)if(k.startsWith('a:'))out.push({k,anim:v._anim,clip:v._attackClipName});return JSON.stringify({src:f?.src,err:fr?.__frameErr||null,ready:fr?.ready,out})})()`));
process.exit(0);
