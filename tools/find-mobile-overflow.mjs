import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const out=[];for(const el of document.querySelectorAll('body *')){const r=el.getBoundingClientRect();if(r.right>innerWidth+1||r.width>innerWidth+1)out.push({tag:el.tagName,cls:String(el.className).slice(0,50),w:Math.round(r.width),right:Math.round(r.right),left:Math.round(r.left)});}return JSON.stringify({inner:innerWidth,scroll:document.documentElement.scrollWidth,off:out.slice(0,20)})})()`));
process.exit(0);
