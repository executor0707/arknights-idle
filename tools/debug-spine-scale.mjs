import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify({
 err: window.__frameErr || null,
 frame: !!document.querySelector('iframe.spine38-frame'),
 canvas: !!document.querySelector('.spine38-canvas'),
 frameInfo: (()=>{const f=document.querySelector('iframe.spine38-frame');return f?.contentWindow?.__frame?.info||null})(),
 sprites: (()=>{const f=document.querySelector('iframe.spine38-frame');const s=f?.contentWindow?.__frame?.sprites;return s?[...s.keys()]:null})(),
} )`));
process.exit(0);
