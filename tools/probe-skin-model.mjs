const page = 'https://prts.wiki/w/' + encodeURIComponent('阿米娅(近卫)');
const t = await (await fetch(page, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' } })).text();
console.log('len', t.length);
for (const kw of ['小人', '模型', 'skin', 'char_spine', 'casc', 'spine']) {
  console.log('\n===', kw, '===');
  let i = 0, n = 0;
  while ((i = t.indexOf(kw, i)) >= 0 && n++ < 8) {
    console.log(t.slice(Math.max(0, i - 180), i + 260).replace(/\s+/g, ' '));
    i += kw.length;
  }
}
