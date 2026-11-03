import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
const js = `JSON.stringify(Object.fromEntries(Object.entries(window.__RESULT__||{}).map(([id,v])=>[id,{error:v.error||null,head:(v.slots||[]).filter(s=>/head|face|mouth|eye|brow/i.test(s)),headBone:(v.bones||[]).filter(b=>/head|eye|mouth/i.test(b)).slice(0,8),bones:(v.bones||[]).length,slots:(v.slots||[]).length}])))`;
console.log(await evalJS(send, js));
process.exit(0);
