globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const g = await import('../build/app/js/game.js');
const d = await import('../build/app/js/data.js');
const rarity = 6;
let exp = 0, lmd = 0;
for (let level = 1; level < 90; level++) {
  exp += g.expNeeded(level, rarity);
  lmd += g.levelLmd(level, rarity);
}
const promoLmd = (7000 + rarity * 1800) + (22000 + rarity * 5000);
const totalExp = exp;
const totalLmd = lmd + promoLmd;
const rates = ['CE-6', 'main-15-3'].map(id => {
  const s = d.STAGE_BY_ID?.get(id) || d.STAGES.find(x => x.id === id);
  return { id, idle: s?.idle };
});
console.log(JSON.stringify({
  rarity,
  levelExp: exp,
  levelLmd: lmd,
  promoLmd,
  totalExp,
  totalLmd,
  totalExpM: totalExp / 1e6,
  totalLmdM: totalLmd / 1e6,
  recordExp: d.MATERIALS.record1?.exp,
  rates,
  hoursCE: totalLmd / 3082.07,
  hours153: totalLmd / 10500,
}, null, 2));
