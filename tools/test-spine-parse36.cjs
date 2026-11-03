const fs = require('fs');
const spine = require('../.cache/spine-ts/package/dist/core/index.js');
console.log('spine', !!spine.SkeletonBinary, !!spine.TextureAtlas);
const base = 'build/app/assets/spine/operators/amiya/char_002_amiya';
const atlasText = fs.readFileSync(base + '.atlas', 'utf8');
const atlas = new spine.TextureAtlas(atlasText, () => ({ setFilters(){}, setWraps(){}, dispose(){}, getImage(){ return { width: 1024, height: 1024 }; } }));
const loader = new spine.AtlasAttachmentLoader(atlas);
const bin = new spine.SkeletonBinary(loader);
const data = bin.readSkeletonData(new Uint8Array(fs.readFileSync(base + '.skel')));
console.log('version', data.version, 'bones', data.bones.length, 'anims', data.animations.length, 'skins', data.skins.length);
console.log(data.animations.slice(0, 10).map(a => a.name));


