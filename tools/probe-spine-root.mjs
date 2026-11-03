const t = await (await fetch('https://prts.wiki/w/' + encodeURIComponent('阿米娅(近卫)'))).text();
let i = t.indexOf('id="spine-root"');
console.log(t.slice(i - 100, i + 2500).replace(/></g, '>\n<'));
console.log('scripts near end');
for (const m of t.slice(i).matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
  if (/spine|model|skin|chara/i.test(m[1])) console.log(m[1].slice(0, 2000));
}
