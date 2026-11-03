import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify({log:window.__SPINE_LOG__,keys:window.__SPINE_DEBUG__?.keys(),loading:[...(window.__SPINE_DEBUG__?.loading||[])]})`));
process.exit(0);
