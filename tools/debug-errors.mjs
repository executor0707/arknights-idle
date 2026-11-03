import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Runtime.enable');
await send('Log.enable');
const errors = [];
// CDP events are delivered as messages; cdp.mjs may expose an event hook? inspect minimal.
console.log('connected');
process.exit(0);
