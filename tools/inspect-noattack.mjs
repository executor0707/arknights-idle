import { connect, evalJS } from './cdp.mjs';
const {send}=await connect();
console.log(await evalJS(send, `(async()=>{const m=await import('./js/skin-spine-remote.js');const b=m.SKIN_SPINE_REMOTE['mlynar-skin1'].base;const [a,s]=await Promise.all([fetch(b+'.atlas').then(r=>r.text()),fetch(b+'.skel').then(r=>r.arrayBuffer())]);const t=new PIXI.spine.core.TextureAtlas(a,(l,cb)=>cb(PIXI.Texture.EMPTY));const bin=new PIXI.spine.core.SkeletonBinary(new PIXI.spine.core.AtlasAttachmentLoader(t));const d=bin.readSkeletonData(new Uint8Array(s));return JSON.stringify(d.animations.map(x=>x.name))})()`, true));
process.exit(0);
