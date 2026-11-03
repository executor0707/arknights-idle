const t = await (await fetch('https://static.prts.wiki/widgets/production/SpineViewer.Cjw6l2fw.js')).text();
for (const kw of ['缩放', '大小', '比例', 'scale', 'zoom', 'fit', 'height']) {
  console.log('\n===', kw, '===');
  let i = 0, n = 0;
  while ((i = t.indexOf(kw, i)) >= 0 && n++ < 10) {
    console.log(t.slice(Math.max(0, i - 180), i + 300));
    i += kw.length;
  }
}
