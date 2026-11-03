const t = await (await fetch('https://prts.wiki/w/' + encodeURIComponent('阿米娅(近卫)'))).text();
const i = t.indexOf('id="SPINEDATA"');
console.log(t.slice(i - 200, i + 4000));
