const path = require('path');
const fs = require('fs');
const sharp = require('C:/Program Files/DSH Desktop/resources/app/node_modules/sharp');

async function convert(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  const files = fs.readdirSync(src).filter(f => f.endsWith('.png'));
  let done = 0, skip = 0, fail = 0;
  const queue = [...files];
  async function worker() {
    while (queue.length) {
      const f = queue.shift();
      const out = path.join(dst, f.replace(/\.png$/, '.webp'));
      if (fs.existsSync(out) && fs.statSync(out).size > 1000) { skip++; continue; }
      try {
        await sharp(path.join(src, f))
          .trim()
          .resize(180, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp({ quality: 82, effort: 3 })
          .toFile(out);
        done++;
        if (done % 40 === 0) console.log(dst, done, '/', files.length);
      } catch (e) {
        fail++;
        console.error('FAIL', f, e.message);
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  console.log('DONE', dst, { done, skip, fail, total: files.length });
}
(async () => {
  await convert('.cache/portraits-v2', 'build/app/assets/operators');
  await convert('.cache/skins-v2', 'build/app/assets/skins');
})();
