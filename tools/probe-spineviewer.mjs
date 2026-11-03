const u = 'https://static.prts.wiki/widgets/production/SpineViewer.Cjw6l2fw.js';
const t = await (await fetch(u)).text();
console.log('len', t.length);
for (const kw of ['char_spine', 'spine', 'skin', 'api', 'assets', 'model']) {
  console.log('\n===', kw, '===');
  let i = 0, n = 0;
  while ((i = t.indexOf(kw, i)) >= 0 && n++ < 8) {
    console.log(t.slice(Math.max(0, i - 220), i + 360));
    i += kw.length;
  }
}
