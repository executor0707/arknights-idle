import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify((()=>{const w=document.querySelector('.spine38-frame').contentWindow;const c=w.document.querySelector('canvas');return {canvasBg:getComputedStyle(c).backgroundColor,canvasStyle:c.getAttribute('style'),bodyBg:getComputedStyle(w.document.body).backgroundColor,htmlBg:getComputedStyle(w.document.documentElement).backgroundColor,frameBg:getComputedStyle(document.querySelector('.spine38-frame')).backgroundColor,rendererBg:w.__frame?.app?.renderer?.backgroundColor,alpha:w.__frame?.app?.renderer?.backgroundAlpha}})())`));
process.exit(0);
