const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('build/app/vendor/SkeletonBinary.js', 'utf8');
const ctx = { console, TextDecoder };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const b = new ctx.SkeletonBinary();
b.data = new Uint8Array(fs.readFileSync('build/app/assets/spine/enemies/soldier/enemy_1002_nsabr.skel'));
try {
  b.initJson();
  console.log('ok', b.json.skeleton, 'bones', b.json.bones?.length, 'slots', b.json.slots?.length, 'skins', b.json.skins?.length, 'anims', Object.keys(b.json.animations || {}));
  console.log(JSON.stringify(b.json).slice(0, 500));
} catch (e) { console.error(e.stack); }
