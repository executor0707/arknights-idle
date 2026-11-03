import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const s=f?.contentWindow?.__frame?.sprites;if(!s)return 'none';const out=[];for(const [k,sp] of s){out.push({k,scale:sp.scale.x,x:Math.round(sp.x),y:Math.round(sp.y),visible:sp.visible,w:Math.round(sp.width),h:Math.round(sp.height),alpha:sp.alpha});}return JSON.stringify(out)})()`));
process.exit(0);
