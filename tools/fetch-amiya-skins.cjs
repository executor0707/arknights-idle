const fs = require('fs');
const path = require('path');
const sharp = require('C:/Program Files/DSH Desktop/resources/app/node_modules/sharp');
const { execFileSync } = require('child_process');
(async () => {
  const names = [
    ['半身像_阿米娅(近卫)_skin1.png', 'char_1001_amiya2-skin1'],
    ['半身像_阿米娅(近卫)_skin2.png', 'char_1001_amiya2-skin2'],
  ];
  fs.mkdirSync('.cache/amiya-skins', { recursive: true });
  for (const [file, id] of names) {
    const api = 'https://prts.wiki/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=' + encodeURIComponent('文件:' + file);
    let url = null;
    for (let i = 0; i < 8 && !url; i++) {
      try {
        const j = await (await fetch(api, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'RhodesIslandIdle/2.0' } })).json();
        const p = Object.values(j.query?.pages || {})[0];
        url = p?.imageinfo?.[0]?.url || null;
      } catch (e) { await new Promise(r => setTimeout(r, 800)); }
    }
    if (!url) { console.log('no url', file); continue; }
    let buf = null;
    for (let i = 0; i < 8 && !buf; i++) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { 'user-agent': 'RhodesIslandIdle/2.0' } });
        if (!r.ok) throw new Error(r.status);
        buf = Buffer.from(await r.arrayBuffer());
      } catch (e) { await new Promise(r => setTimeout(r, 900)); }
    }
    if (!buf) { console.log('no image', id); continue; }
    const png = path.join('.cache/amiya-skins', id + '.png');
    fs.writeFileSync(png, buf);
    const im = sharp(png).trim().resize(180, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    await im.webp({ quality: 86 }).toFile(path.join('build/app/assets/skins', id + '.webp'));
    console.log('saved', id);
  }
})();
