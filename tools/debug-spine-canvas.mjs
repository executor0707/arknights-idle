import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const c=document.querySelector('.spine38-canvas');const a=document.getElementById('arena');const cs=getComputedStyle(c);const as=getComputedStyle(a);return JSON.stringify({canvas:{display:cs.display,opacity:cs.opacity,z:cs.zIndex,transform:cs.transform,w:c.width,h:c.height,cssW:c.clientWidth,cssH:c.clientHeight},arena:{w:a.clientWidth,h:a.clientHeight,overflow:as.overflow},frame:{display:getComputedStyle(document.querySelector('iframe.spine38-frame')).display,opacity:getComputedStyle(document.querySelector('iframe.spine38-frame')).opacity}})})()`));
process.exit(0);
