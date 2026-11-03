const t = await (await fetch('https://prts.wiki/w/' + encodeURIComponent('阿米娅(近卫)/spine'))).text();
let i = t.indexOf('casc_1');
let n = 0;
while (i >= 0 && n++ < 8) {
  console.log(t.slice(Math.max(0, i - 240), i + 300).replace(/\s+/g, ' '));
  i = t.indexOf('casc_1', i + 1);
}
console.log('static', [...t.matchAll(/static\.prts\.wiki[^"'<> ]+/g)].slice(0, 10).map(m => m[0]));
