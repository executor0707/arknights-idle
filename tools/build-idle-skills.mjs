import fs from 'node:fs';
import { OPERATORS } from '../build/app/js/operators.js';

const chars = JSON.parse(fs.readFileSync('.cache/character_table.json', 'utf8'));
const skillTable = JSON.parse(fs.readFileSync('.cache/skill_table.json', 'utf8'));

const TYPES = new Set(['aoe', 'nuke', 'multi', 'heal', 'buff', 'shield', 'control', 'debuff', 'execute']);
const BLOCKED = /弹药|子弹|装填|召唤|召唤物|心烛|战术装备|魂灵之影|小自在|纸偶|黄金盟誓|戴乌|沙之碑|方尖塔|征服者传说|中继器|机动盾牌|冰凌|陨石|簇火/;

function clean(text, blackboard = []) {
  const bb = new Map((blackboard || []).map(b => [b.key, b]));
  return String(text || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\r?\n/g, ' ')
    .replace(/\{([^{}]+)\}/g, (m, expr) => {
      const [key, def = ''] = expr.split(':');
      const b = bb.get(key);
      if (!b) return '';
      return def.includes('%') ? `${Math.round((Number(b.value) || 0) * 100)}%` : String(b.value);
    })
    .replace(/\s+/g, ' ').trim();
}
function levelOf(skill) { return skill.levels[skill.levels.length - 1]; }
function usable(skill) {
  const level = levelOf(skill);
  const desc = clean(level.description, level.blackboard);
  return !!desc && !BLOCKED.test(desc) && !/弹药|子弹|召唤/.test(level.name || '') &&
    !/职业模板|自动释放.*对战场产生效果/.test(desc);
}
function typeOf(text) {
  if (/治疗|恢复.*生命|回复.*生命|愈合/.test(text)) return 'heal';
  if (/屏障|护盾|庇护|防御力.*(提升|提高|[+＋])|法抗.*(提升|提高|[+＋])/.test(text)) return 'shield';
  if (/晕眩|停顿|束缚|冻结|减速|沉默|击退|浮空/.test(text)) return 'control';
  if (/攻击力.*(提升|提高|[+＋])|攻击速度|攻击间隔.*缩短/.test(text)) return 'buff';
  if (/所有敌人|范围内|群体|溅射|周围.*敌人|前方.*敌人/.test(text)) return 'aoe';
  if (/连续|多次|额外.*次|攻击.*次|连击/.test(text)) return 'multi';
  if (/真实伤害|斩杀/.test(text)) return 'execute';
  if (/脆弱|受到.*伤害.*提升|防御力.*降低|法术抗性.*降低/.test(text)) return 'debuff';
  if (/造成.*伤害/.test(text)) return 'nuke';
  return 'buff';
}
function nums(bb, keys) {
  const m = new Map((bb || []).map(b => [b.key, Number(b.value) || 0]));
  for (const k of keys) if (m.has(k)) return m.get(k);
  return 0;
}
function idleDesc(name, type, power, duration, hits) {
  const p = Math.round((Number(power) || 1) * 100);
  switch (type) {
    case 'heal': return `${name}：立即治疗全体友军，治疗量为自身攻击力的 ${p}%。`;
    case 'shield': return `${name}：为全队提供 ${duration} 秒护盾，护盾量相当于自身最大生命的 ${p}%。`;
    case 'control': return `${name}：对范围内敌人造成攻击力 ${p}% 的伤害，并使其停顿 ${duration} 秒。`;
    case 'aoe': return `${name}：对范围内所有敌人造成攻击力 ${p}% 的伤害。`;
    case 'multi': return `${name}：连续攻击 ${hits || 3} 次，每次造成攻击力 ${p}% 的伤害。`;
    case 'nuke': return `${name}：对当前生命最低的敌人造成攻击力 ${p}% 的伤害。`;
    case 'debuff': return `${name}：对范围内敌人造成攻击力 ${p}% 的伤害，并使其受到伤害提高。`;
    case 'execute': return `${name}：对生命比例最低的敌人造成攻击力 ${p}% 的真实伤害。`;
    default: return `${name}：${duration} 秒内提升自身与全队攻击力 ${Math.max(10, Math.round(((power || 1) - 1) * 100))}%。`;
  }
}

function candidates(op) {
  const exact = chars[op.id];
  const byName = Object.entries(chars).filter(([, c]) => c.name === op.name && (c.skills || []).length);
  const entry = exact ? [op.id, exact] : byName[0];
  if (!entry) return [];
  return (entry[1].skills || []).map(s => skillTable[s.skillId]).filter(Boolean);
}

const overrides = {};
const blockedCount = {};
const fallback = [];
for (const op of OPERATORS) {
  const list = candidates(op);
  let chosen = list.find(s => levelOf(s).name === op.skill?.name && usable(s));
  if (!chosen) chosen = list.find(usable);
  if (chosen) {
    const level = levelOf(chosen);
    const desc = clean(level.description, level.blackboard);
    const bb = level.blackboard || [];
    let type = typeOf(desc);
    if (!TYPES.has(type)) type = 'buff';
    const atkBuff = nums(bb, ['atk']);
    const atkScale = nums(bb, ['atk_scale', 'attack@atk_scale', 'atk_scale_2', 'attack@append_atk_scale', 'damage_scale']);
    let power;
    if (type === 'heal') power = Math.max(0.8, 1 + atkScale);
    else if (type === 'shield') power = Math.max(0.2, nums(bb, ['hp_ratio', 'shield_scale', 'damage_resistance', 'def']) || 0.25);
    else power = Math.max(0.9, Math.min(5.5, 1 + atkBuff + atkScale));
    let duration = Math.max(2, Math.min(18, Number(level.duration) || (type === 'buff' ? 8 : type === 'shield' ? 6 : 4)));
    if (type === 'shield') duration = 8;
    const hits = Math.max(1, Math.min(8, Math.round(nums(bb, ['attack@max_target', 'max_target', 'times', 'hit', 'attack_times']) || (type === 'multi' ? 3 : 1))));
    overrides[op.id] = {
      name: level.name || op.skill?.name || chosen.skillId,
      type,
      power: Number(power.toFixed(2)),
      duration: Number(duration.toFixed(1)),
      ...(type === 'multi' ? { hits } : {}),
      desc: idleDesc(level.name || op.skill?.name, type, power, duration, hits),
    };
  } else {
    const original = op.skill || {};
    const type = TYPES.has(original.type) ? original.type : 'buff';
    const power = Number(original.power) || 1;
    let duration = Number(original.duration) || 6;
    if (type === 'shield') duration = 8;
    const hits = type === 'multi' ? 3 : undefined;
    const name = String(original.name || '战术指令')
      .replace(/弹药|子弹|召唤物|召唤/g, '火力')
      .replace(/快速部署/g, '迅捷斩击');
    overrides[op.id] = {
      name,
      type, power, duration, ...(hits ? { hits } : {}),
      desc: idleDesc(name, type, power, duration, hits),
    };
    fallback.push(op.id + '|' + op.name);
  }
  for (const s of list) {
    const d = clean(levelOf(s).description, levelOf(s).blackboard);
    if (BLOCKED.test(d)) blockedCount[s.skillId] = (blockedCount[s.skillId] || 0) + 1;
  }
}
const badType = Object.values(overrides).filter(s => !TYPES.has(s.type));
const badText = Object.entries(overrides).filter(([, s]) => BLOCKED.test(s.desc));
const ammoText = Object.values(overrides).filter(s => /弹药|子弹|装填/.test(s.desc));
const badNames = Object.entries(overrides).filter(([, s]) => /弹药|子弹|召唤/.test(s.name));
fs.writeFileSync('build/app/js/skill-overrides.js',
  '// Generated from Arknights zh_CN character/skill tables. Idle-only adaptations:\n// no summons, no ammo/bullet skills, only effects supported by battle.js.\nexport const SKILL_OVERRIDES = ' + JSON.stringify(overrides, null, 2) + ';\n');
console.log(JSON.stringify({
  total: OPERATORS.length,
  overrides: Object.keys(overrides).length,
  fallback,
  blockedSkillsRemoved: Object.keys(blockedCount).length,
  badType: badType.length,
  badText: badText.map(([id, s]) => id + '|' + s.desc),
  badNames: badNames.map(([id, s]) => id + '|' + s.name),
  ammoText: ammoText.length,
  types: Object.values(overrides).reduce((a, s) => (a[s.type] = (a[s.type] || 0) + 1, a), {}),
}, null, 2));
