import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const s=f?.contentWindow?.__frame?.sprites;for(const sp of s.values()){sp.scale.set(0.1,0.1)}return s.size})()`);
await new Promise(r=>setTimeout(r,700));
await screenshot(send,'.cache/scale-0.1.png',1440,1000);
process.exit(0);
