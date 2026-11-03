const u = 'https://prts.wiki/w/' + encodeURIComponent('阿米娅(近卫)/spine');
const r = await fetch(u, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' } });
const t = await r.text();
console.log('status', r.status, 'len', t.length);
const seen = new Set();
for (const m of t.matchAll(/char_1001_amiya2[^"'<> ]+/g)) {
  const v = m[0];
  if (!seen.has(v)) { seen.add(v); console.log(v.slice(0, 200)); }
}
console.log('--- spine mentions ---');
for (const m of t.matchAll(/.{0,80}(?:skin|spine).{0,120}/gi)) {
  if (/char_1001|spine|skin/i.test(m[0])) console.log(m[0].replace(/<[^>]+>/g, ' ').slice(0, 220));
}
