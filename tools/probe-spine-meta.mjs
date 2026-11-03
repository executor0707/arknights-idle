const u = 'https://static.prts.wiki/assets/char_spine/char_1001_amiya2/meta.json';
const r = await fetch(u);
console.log(r.status);
const j = await r.json();
console.log(JSON.stringify(j, null, 2).slice(0, 6000));
