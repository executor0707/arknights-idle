import { connect, evalJS } from './cdp.mjs';
const {send}=await connect();
console.log(await evalJS(send, `JSON.stringify({skins:__RHODES__.G.SKINS?.length,hasMlynar:__RHODES__.G.SKINS?.some(s=>s.id==='mlynar-skin1'),hasLiskarm:__RHODES__.G.SKINS?.some(s=>s.id==='liskarm-skin1'),sora:__RHODES__.G.SKINS?.some(s=>s.opId==='char_101_sora')})`));
process.exit(0);
