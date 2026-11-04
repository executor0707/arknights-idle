import fs from 'node:fs';
import { OPERATORS } from '../build/app/js/operators.js';

const chars = JSON.parse(fs.readFileSync('.cache/character_table.json', 'utf8'));
const skillTable = JSON.parse(fs.readFileSync('.cache/skill_table.json', 'utf8'));

const CUSTOM = {
  '12f': { type: 'shield', power: 0.28, duration: 6, desc: '12F 展开闪避姿态，短时间降低受到的伤害，并在下一次攻击中附加法术伤害。' },
  'char_1001_amiya2': { type: 'multi', power: 2.6, hits: 4, duration: 4, desc: '阿米娅挥出影霄连斩，连续攻击最多 4 名敌人，最后一击造成更高的法术伤害。' },
  'char_1037_amiya3': { type: 'heal', power: 1.6, duration: 8, desc: '阿米娅展开慈悲愿景，治疗全体友军，并为生命最低的友军附加持续恢复。' },
  'char_4188_confes': { type: 'buff', power: 0.55, duration: 8, desc: 'CONFESS-47 发布战术指令，短时间提升全队攻击力，并加快技能回转。' },
  'char_286_cast3': { type: 'shield', power: 0.3, duration: 7, desc: 'Castle-3 启动支援协议，为最近的友军提供护盾并提升其防御力。' },
  'durin': { type: 'buff', power: 0.5, duration: 8, desc: '杜林集中源石技艺，短时间内提升自身攻击力，并使下一次攻击附带法术伤害。' },
  'char_4093_frston': { type: 'shield', power: 0.24, duration: 8, desc: 'Friston-3 展开考古防护场，为周围友军提供护盾并减缓敌人推进。' },
  'char_4227_gallus': { type: 'aoe', power: 1.9, duration: 4, desc: 'GALLUS² 释放高频术式，对范围内所有敌人造成法术伤害。' },
  'noir_corne': { type: 'shield', power: 0.3, duration: 6, desc: '黑角压低盾牌进入防御姿态，短时间大幅提升自身防御力。' },
  'char_4220_kormr': { type: 'multi', power: 2.1, hits: 3, duration: 4, desc: '虎狼丸连续扑击最近的敌人，每次命中造成物理伤害。' },
  'char_285_medic2': { type: 'heal', power: 1.5, duration: 7, desc: 'Lancet-2 启动医疗协议，治疗生命最低的友军并附加短时持续恢复。' },
  'char_4215_buddy': { type: 'buff', power: 0.45, duration: 8, desc: '罗德岛隐秘队展开协同行动，短时间提升全队攻击力与技能回转。' },
  'char_4136_phonor': { type: 'control', power: 1.2, duration: 3, desc: 'PhonoR-0 播放干扰音波，使范围内敌人停顿并降低其防御力。' },
  'char_376_therex': { type: 'aoe', power: 2.4, duration: 3, desc: 'THRM-EX 冲向敌群自爆，对周围所有敌人造成高额法术伤害。' },
  'char_4077_palico': { type: 'multi', power: 2.2, hits: 4, duration: 4, desc: '泰拉大陆调查团呼叫连续射击，对多个敌人造成物理伤害。' },
  'char_4091_ulika': { type: 'buff', power: 0.4, duration: 8, desc: 'U-Official 进行现场播报，短时间提升全队攻击力并回复技力。' },
  'rangers': { type: 'multi', power: 2.0, hits: 3, duration: 4, desc: '巡林者拉满弓弦，连续射击最近的敌人，每次造成物理伤害。' },
  'yato': { type: 'multi', power: 2.2, hits: 3, duration: 4, desc: '夜刀快速切入战场，连续斩击最近的敌人并短暂提升自身攻击速度。' },
  'char_506_rmedic': { type: 'heal', power: 1.35, duration: 8, desc: '预备干员-后勤展开野战医疗，治疗全体友军并附加持续恢复。' },
  'char_504_rguard': { type: 'shield', power: 0.25, duration: 6, desc: '预备干员-近战举盾挡在前排，短时间提升自身防御并保护身后友军。' },
  'char_507_rsnipe': { type: 'multi', power: 1.9, hits: 3, duration: 4, desc: '预备干员-狙击进行压制射击，连续攻击最近的敌人。' },
  'char_505_rcast': { type: 'aoe', power: 1.8, duration: 4, desc: '预备干员-术师引导源石技艺，对范围内敌人造成法术伤害。' },
  'char_514_rdfend': { type: 'shield', power: 0.28, duration: 7, desc: '预备干员-重装架起防盾，为自身与周围友军提供护盾。' },
  'char_4000_jnight': { type: 'multi', power: 1.8, hits: 3, duration: 4, desc: '正义骑士号锁定目标连射，对最近的敌人造成多段物理伤害。' },
};

function cleanText(text, blackboard = []) {
  const bb = new Map((blackboard || []).map(b => [b.key, b]));
  let s = String(text || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.replace(/\{([^{}]+)\}/g, (m, expr) => {
    const [keyRaw, defRaw = ''] = expr.split(':');
    const b = bb.get(keyRaw);
    if (!b) return '';
    const def = defRaw || '';
    const value = b.value;
    if (def.includes('%')) return `${Math.round((Number(value) || 0) * 100)}%`;
    if (Number.isInteger(value)) return String(value);
    return String(Math.round((Number(value) || 0) * 10) / 10);
  });
  return s.replace(/\s+([，。；、])/g, '$1').replace(/\s+/g, ' ').trim();
}

function classify(text) {
  if (/治疗|恢复.*生命|回复.*生命|愈合/.test(text)) return 'heal';
  if (/屏障|护盾|庇护|获得.*防御|防御力.*(提升|提高|[+＋])|法抗.*(提升|提高|[+＋])/.test(text)) return 'shield';
  if (/召唤|战术装备|召唤物|分身|傀儡/.test(text)) return 'summon';
  if (/晕眩|停顿|束缚|冻结|减速|沉默|击退|浮空/.test(text)) return 'control';
  if (/攻击力.*提升|攻击力.*\+|攻击速度|攻击间隔.*缩短|攻击间隔.*增大/.test(text)) return 'buff';
  if (/所有敌人|范围内|群体|溅射|周围.*敌人|前方.*敌人/.test(text)) return 'aoe';
  if (/连续|多次|额外.*次|攻击.*次|连击/.test(text)) return 'multi';
  if (/真实伤害|斩杀/.test(text)) return 'execute';
  if (/脆弱|受到.*伤害.*提升|防御力.*降低|法术抗性.*降低/.test(text)) return 'debuff';
  if (/造成.*伤害/.test(text)) return 'nuke';
  return 'buff';
}
function numFrom(bb, keys) {
  const map = new Map((bb || []).map(b => [b.key, Number(b.value) || 0]));
  for (const k of keys) if (map.has(k)) return map.get(k);
  return 0;
}
function chooseSkill(op) {
  const exact = chars[op.id];
  const nameMatches = Object.entries(chars).filter(([id, c]) => c.name === op.name && (c.skills || []).length);
  const candidates = exact ? [[op.id, exact]] : nameMatches;
  if (!candidates.length) return null;
  const [cid, c] = candidates[0];
  const list = (c.skills || []).map(s => skillTable[s.skillId]).filter(Boolean);
  if (!list.length) return null;
  let chosen = list.find(s => s.levels?.[0]?.name === op.skill?.name);
  if (!chosen) chosen = list[list.length - 1];
  return { cid, chosen };
}

const overrides = {};
const unresolved = [];
for (const op of OPERATORS) {
  const picked = chooseSkill(op);
  let entry = null;
  if (picked) {
    const level = picked.chosen.levels[picked.chosen.levels.length - 1];
    const bb = level.blackboard || [];
    const desc = cleanText(level.description, bb);
    if (desc && !/职业模板|自动释放.*对战场产生效果/.test(desc)) {
      const type = classify(desc);
      const atkBuff = numFrom(bb, ['atk']);
      const atkScale = numFrom(bb, ['atk_scale', 'attack@atk_scale', 'atk_scale_2', 'attack@append_atk_scale', 'damage_scale']);
      let power;
      if (type === 'heal') power = Math.max(0.8, 1 + atkScale);
      else if (type === 'shield') power = Math.max(0.2, numFrom(bb, ['hp_ratio', 'shield_scale', 'damage_resistance', 'def']) || 0.25);
      else if (type === 'summon') power = Math.max(0.4, 1 + atkScale);
      else power = Math.max(0.9, Math.min(5.5, 1 + atkBuff + atkScale));
      const duration = Math.max(2, Math.min(18, Number(level.duration) || (type === 'buff' ? 8 : type === 'shield' ? 6 : 4)));
      const hits = Math.max(1, Math.min(8, Math.round(numFrom(bb, ['attack@max_target', 'max_target', 'times', 'hit', 'attack_times']) || (type === 'multi' ? 3 : 1))));
      const count = Math.max(1, Math.min(4, Math.round(numFrom(bb, ['cnt', 'count', 'summon_cnt', 'token_cnt']) || 1)));
      entry = {
        name: level.name || op.skill?.name || picked.chosen.skillId,
        type, power: Number(power.toFixed(2)), duration: Number(duration.toFixed(1)),
        ...(hits > 1 ? { hits } : {}), ...(type === 'summon' ? { count } : {}), desc,
      };
    }
  }
  if (!entry && CUSTOM[op.id]) {
    const c = CUSTOM[op.id];
    entry = { name: op.skill?.name || '战术指令', ...c, ...(c.hits ? { hits: c.hits } : {}) };
  }
  if (!entry) {
    unresolved.push(op.id + '|' + op.name);
    entry = {
      name: op.skill?.name || '战术指令', type: op.skill?.type || 'buff',
      power: op.skill?.power || 1, duration: op.skill?.duration || 6,
      desc: `${op.name}释放「${op.skill?.name || '战术指令'}」，对当前战局产生针对性效果。`,
    };
  }
  overrides[op.id] = entry;
}
const genericLeft = Object.values(overrides).filter(s => /职业模板|自动释放.*对战场产生效果/.test(s.desc)).length;
if (unresolved.length || genericLeft) console.log({ unresolved, genericLeft });
fs.writeFileSync('build/app/js/skill-overrides.js',
  '// Generated from Arknights zh_CN character/skill tables (Kengxxiao/ArknightsGameData).\n// One thematic signature skill per operator; descriptions are adapted for this battle system.\nexport const SKILL_OVERRIDES = ' + JSON.stringify(overrides, null, 2) + ';\n');
console.log(JSON.stringify({
  total: OPERATORS.length, overrides: Object.keys(overrides).length, unresolved, genericLeft,
  types: Object.values(overrides).reduce((a, s) => (a[s.type] = (a[s.type] || 0) + 1, a), {}),
}, null, 2));
