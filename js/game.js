import { OPERATORS, STARTERS } from './operators.js';
import {
  SAVE_KEY, SAVE_VERSION, MAX_SQUAD, PULL_COST, OFFLINE_CAP_HOURS,
  MATERIALS, STAGES, BANNERS, ROOMS, DAILY_TASKS, SHOP_ITEMS,
  RARITY_BASE, ROLE_MODS, RECORD_ORDER, SKIN_PRICE, PRIME_SHARD_COST, SELECTOR_COST,
  makeEndlessStage, MAX_ENDLESS_FLOOR,
} from './data.js';
import { SKINS, SKIN_BY_ID, SKINS_BY_OP } from './skins.js';
import { RANDOM_EVENTS } from './events.js';

export { STAGES, OPERATORS, SKINS };
export const OP_BY_ID = new Map(OPERATORS.map(o => [o.id, o]));
export const STAGE_BY_ID = new Map(STAGES.map(s => [s.id, s]));
export const bus = new EventTarget();

const CLASS_KEY = { 先锋: 'vanguard', 近卫: 'guard', 重装: 'defender', 狙击: 'sniper', 术师: 'caster', 医疗: 'medic', 辅助: 'supporter', 特种: 'specialist' };
// Melee units engage roughly two body-lengths in front/behind, independent of
// their old narrow 13-15% auto-attack range. Ranged roles keep ROLE_MODS range.
const MELEE_ROLES = new Set(['vanguard', 'guard', 'defender', 'specialist']);
const MELEE_RANGE = 26;
// Requested specialist treatments: 钩索师 / 巡空者 / 怪杰 / 陷阱师 / 行商 / 炼金师.
// All use the sniper engagement range and do not block.
const RANGED_SPECIALIST_RANGE = new Map([
  ['钩索师', 62], ['巡空者', 62], ['怪杰', 62],
  ['陷阱师', 62], ['行商', 62], ['炼金师', 62],
]);
const CAPS = { 2: [30], 3: [40, 55], 4: [45, 60, 70], 5: [50, 70, 80], 6: [50, 80, 90] };
export const USEFUL_ITEM_IDS = new Set([
  'record1', 'record2', 'record3', 'record4',
  'book1', 'book2', 'book3', 'chip', 'chip_pack', 'module', 'token', 'base_block',
]);
// Control room gives 0.05% crit per level on top of the 5% base crit.
export const CONTROL_MAX_LEVEL = 1900;
const MAX_ELITE = { 2: 0, 3: 1, 4: 2, 5: 2, 6: 2 };
const TUTORIAL_FLAG = 'rhodes_idle_tutorial_v1';

function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function defaultBannerState() {
  return { since6: 0, since5: 0, total: 0, spark: 0 };
}

export function createDefaultState() {
  const now = Date.now();
  const ops = {};
  const initial = [...STARTERS, ...OPERATORS.filter(o => o.rarity === 2).map(o => o.id)];
  for (const id of initial) ops[id] = { level: 1, elite: 0, potential: 1, skill: 1, mastery: 0, trust: 0, module: 0, exp: 0 };
  const squad = [...STARTERS].slice(0, MAX_SQUAD);
  while (squad.length < MAX_SQUAD) squad.push(null);
  return {
    version: SAVE_VERSION,
    createdAt: now,
    lastSeen: now,
    doctor: { name: '博士', level: 1, exp: 0, todayLevels: 0, todayDate: dateKey() },
    lmd: 36000,
    orundum: 60000,
    primes: 0,
    primeShards: 0,
    distinction: 0,
    operators: ops,
    squad,
    inventory: {
      record1: 40, record2: 20, record3: 8, record4: 0,
      book1: 6, book2: 2, book3: 0,
      chip: 30, chip_pack: 10,
      module: 0, token: 0, base_block: 20,
    },
    stage: { selected: 'CE-6', cleared: [], firstClear: {}, auto: true, speed: 1, totalRuns: 0, endlessRetry: null },
    deploy: {},
    idle: { orundum: 0, shards: 0, blocks: 0, lmd: 0, exp: 0, chips: 0, chipPacks: 0, seconds: 0 },
    skins: { owned: {}, equipped: {}, scale: {} },
    gacha: {
      standard: defaultBannerState(), limited: defaultBannerState(), collab: defaultBannerState(),
      history: [], totalPulls: 0, selectorsUsed: 0,
    },
    base: {
      rooms: Object.fromEntries(ROOMS.map(r => [r.id, { level: 1, damaged: false }])),
      expPool: 0, materialProgress: 0, bookProgress: 0, blockProgress: 0,
      sabotageTimer: 0, sabotageCount: 0, sabotageLog: [], lastEventAt: 0,
    },
    stats: { runs: 0, wins: 0, losses: 0, kills: 0, battleSeconds: 0, pulls: 0, levels: 0, promotions: 0, repairs: 0, offlineSec: 0 },
    daily: { date: dateKey(), runs: 0, pulls: 0, levels: 0, repairs: 0, annihilation: 0, claimed: [], supplyClaimed: false },
    shop: { date: dateKey(), stock: Object.fromEntries(SHOP_ITEMS.map(i => [i.id, i.stock])) },
    settings: { sound: true, reduceMotion: false, autoSkill: true, characterScale: 1.2, enemyScale: 1 },
    randomEvent: { nextAt: 0, log: [] },
    tutorialDone: localStorage.getItem(TUTORIAL_FLAG) === '1',
    seenOffline: 0,
  };
}

export let state = createDefaultState();

export function resetState() {
  state = createDefaultState();
  saveNow();
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== 'object') return base;
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], v);
    } else if (v !== undefined) out[k] = v;
  }
  return out;
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = deepMerge(createDefaultState(), parsed);
      state.version = SAVE_VERSION;
    }
  } catch (e) {
    console.warn('存档读取失败，使用新存档', e);
    state = createDefaultState();
  }
  const oldEndlessSelected = String(state.stage.selected || '').match(/^endless-(\d+)$/);
  const oldEndlessCleared = (state.stage.cleared || [])
    .map(id => String(id).match(/^endless-(\d+)$/))
    .filter(Boolean)
    .map(m => Number(m[1]));
  const endlessTarget = Math.max(
    oldEndlessSelected ? Number(oldEndlessSelected[1]) : 0,
    oldEndlessCleared.length ? Math.max(...oldEndlessCleared) + 1 : 0,
    1,
  );
  if (endlessTarget > 1) ensureEndlessFloor(endlessTarget);
  if (oldEndlessSelected) state.stage.selected = 'endless-' + endlessTarget;
  if (state.stage.endlessRetry) {
    const retry = STAGE_BY_ID.get(state.stage.endlessRetry);
    if (!retry || retry.group !== 'endless' || retry.floor <= 1) state.stage.endlessRetry = null;
    else ensureEndlessFloor(retry.floor - 1);
  }
  if (!STAGE_BY_ID.has(state.stage.selected)) state.stage.selected = 'CE-6';
  state.squad = state.squad.map(id => id && OP_BY_ID.has(id) ? id : null).slice(0, MAX_SQUAD);
  while (state.squad.length < MAX_SQUAD) state.squad.push(null);
  if (!state.deploy || typeof state.deploy !== 'object') state.deploy = {};
  const chipKeys = ['chip_vanguard', 'chip_guard', 'chip_defender', 'chip_sniper', 'chip_caster', 'chip_medic', 'chip_supporter', 'chip_specialist'];
  const packKeys = ['pack_vanguard', 'pack_guard', 'pack_defender', 'pack_sniper', 'pack_caster', 'pack_medic', 'pack_supporter', 'pack_specialist'];
  let chipSum = 0, packSum = 0;
  for (const k of chipKeys) { chipSum += Number(state.inventory[k]) || 0; delete state.inventory[k]; }
  for (const k of packKeys) { packSum += Number(state.inventory[k]) || 0; delete state.inventory[k]; }
  if (chipSum > 0 || packSum > 0) {
    state.inventory.chip = (state.inventory.chip || 0) + chipSum;
    state.inventory.chip_pack = (state.inventory.chip_pack || 0) + packSum;
  }
  // Remove pre-simplification materials that no longer have any use.
  for (const id of Object.keys(state.inventory)) {
    if (!USEFUL_ITEM_IDS.has(id)) delete state.inventory[id];
  }
  if (!state.idle) state.idle = { orundum: 0, shards: 0, blocks: 0, lmd: 0, exp: 0, chips: 0, chipPacks: 0, seconds: 0 };
  if (typeof state.idle.chips !== 'number') state.idle.chips = 0;
  if (typeof state.idle.chipPacks !== 'number') state.idle.chipPacks = 0;
  if (!state.settings || typeof state.settings !== 'object') state.settings = {};
  if (!Number.isFinite(state.settings.characterScale)) state.settings.characterScale = 1.2;
  if (!Number.isFinite(state.settings.enemyScale)) state.settings.enemyScale = 1;
  state.settings.characterScale = Math.min(2, Math.max(0.5, state.settings.characterScale));
  state.settings.enemyScale = Math.min(2, Math.max(0.5, state.settings.enemyScale));
  if (!state.skins.scale || typeof state.skins.scale !== 'object') state.skins.scale = {};
  if (!state.randomEvent || typeof state.randomEvent !== 'object') state.randomEvent = { nextAt: 0, log: [] };
  if (!Array.isArray(state.randomEvent.log)) state.randomEvent.log = [];
  unlockAmiyaForms();
  ensureDaily();
  ensureShop();
  return state;
}

export function saveNow() {
  state.lastSeen = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('存档写入失败', e);
  }
}

export function setTutorialDone() {
  state.tutorialDone = true;
  localStorage.setItem(TUTORIAL_FLAG, '1');
  saveNow();
}

// ── 通用经济 ───────────────────────────────────────────────────────
export function itemCount(id) { return Math.floor(state.inventory[id] || 0); }
export function addItem(id, n = 1) {
  if (!MATERIALS[id]) return;
  state.inventory[id] = (state.inventory[id] || 0) + n;
}
export function takeItem(id, n = 1) {
  if (itemCount(id) < n) return false;
  state.inventory[id] -= n;
  if (state.inventory[id] < 0.00001) state.inventory[id] = 0;
  return true;
}
export function canPay(cost = {}) {
  if ((cost.lmd || 0) > state.lmd) return false;
  if ((cost.orundum || 0) > state.orundum) return false;
  if ((cost.distinction || 0) > state.distinction) return false;
  for (const [id, n] of Object.entries(cost.items || {})) if (itemCount(id) < n) return false;
  return true;
}
export function pay(cost = {}) {
  if (!canPay(cost)) return false;
  state.lmd -= cost.lmd || 0;
  state.orundum -= cost.orundum || 0;
  state.distinction -= cost.distinction || 0;
  for (const [id, n] of Object.entries(cost.items || {})) takeItem(id, n);
  return true;
}
export function itemName(id) { return MATERIALS[id]?.name || id; }

function notify(text, tone = 'info') {
  bus.dispatchEvent(new CustomEvent('notice', { detail: { text, tone } }));
}

// ── 干员与养成 ─────────────────────────────────────────────────────
export function opData(id) { return OP_BY_ID.get(id); }
export function owned(id) { return !!state.operators[id]; }
export function opState(id) { return state.operators[id]; }
export function ensureOp(id) {
  if (!state.operators[id]) state.operators[id] = { level: 1, elite: 0, potential: 1, skill: 1, mastery: 0, trust: 0, module: 0, exp: 0 };
  return state.operators[id];
}

export const AMIYA_GUARD_ID = 'char_1001_amiya2';
export const AMIYA_MEDIC_ID = 'char_1037_amiya3';
export const AMIYA_FORM_IDS = new Set([AMIYA_GUARD_ID, AMIYA_MEDIC_ID]);
export function amiyaFormUnlocked(formId) {
  if (formId === AMIYA_GUARD_ID) return state.stage.cleared.includes('main-R8-11');
  if (formId === AMIYA_MEDIC_ID) return state.stage.cleared.includes('main-14-23');
  return true;
}
export function unlockAmiyaForms() {
  if (amiyaFormUnlocked(AMIYA_GUARD_ID)) ensureOp(AMIYA_GUARD_ID);
  if (amiyaFormUnlocked(AMIYA_MEDIC_ID)) ensureOp(AMIYA_MEDIC_ID);
}
export function maxElite(rarity) { return MAX_ELITE[rarity] ?? 2; }
export function levelCap(rarity, elite) { return (CAPS[rarity] || CAPS[6])[Math.min(elite, maxElite(rarity))]; }
export function expNeeded(level, rarity) {
  return Math.max(20, Math.round((36 + level * 22 + Math.pow(level, 1.6) * 3.5) * (0.7 + rarity * 0.1)));
}
export function levelLmd(level, rarity) { return Math.ceil(expNeeded(level, rarity) * 0.62 + 30); }

export function getOpStats(id) {
  const data = opData(id);
  const s = opState(id);
  if (!data || !s) return null;
  const base = RARITY_BASE[data.rarity];
  const mod = ROLE_MODS[data.role];
  const levelMul = 1 + (s.level - 1) * 0.014;
  const eliteMul = 1 + s.elite * 0.38;
  const potMul = 1 + (s.potential - 1) * 0.02;
  const trustMul = 1 + (s.trust / 100) * 0.08;
  const moduleMul = 1 + (s.module || 0) * 0.04;
  let hp = base.hp * mod.hp * levelMul * eliteMul * potMul * trustMul * moduleMul;
  let atk = base.atk * mod.atk * levelMul * eliteMul * potMul * trustMul * moduleMul;
  let def = base.def * mod.def * levelMul * eliteMul * potMul * trustMul * moduleMul;
  let res = base.res * mod.res * (1 + s.elite * 0.12) * (1 + (s.module || 0) * 0.05);
  // Role-level PRTS cadence, compressed slightly for readable idle combat.
  let interval = mod.interval * 0.82;
  if (data.rarity === 5) atk *= 1.06;
  if (data.rarity === 4) hp *= 1.05;
  if (data.rarity === 3) def *= 1.04;
  if (id === 'exusiai') interval *= 0.87;
  if (id === 'eyjafjalla') atk *= 1.15;
  if (id === 'nian') def *= 1.1;
  if (s.potential >= 3) atk *= 1.02;
  if (s.potential >= 5) { atk *= 1.03; hp *= 1.03; interval *= 0.94; }
  const skillPower = 1 + (s.skill - 1) * 0.055 + (s.mastery || 0) * 0.075 + (s.potential >= 5 ? 0.1 : 0);
  return {
    id, hp, atk, def, res, interval,
    range: (data.role === 'specialist' && RANGED_SPECIALIST_RANGE.get(data.sub)) || (MELEE_ROLES.has(data.role) ? MELEE_RANGE : mod.range),
    block: data.role === 'specialist' && RANGED_SPECIALIST_RANGE.has(data.sub) ? 0 : mod.block,
    role: data.role, arts: !!mod.arts, heal: !!mod.heal, skillPower,
  };
}

export function opPower(id) {
  const st = getOpStats(id);
  if (!st) return 0;
  const b = getBaseBonuses();
  const atkW = st.heal ? 4.2 : 3;
  return Math.round(st.atk * atkW * (1 + b.atk) + st.hp * 0.35 * (1 + b.hp) + st.def * 1.5 + st.res * 1.2 + st.skillPower * 55 * (1 + b.crit * 2));
}

export function getSquadBuffs(ids = state.squad.filter(Boolean)) {
  const buffs = { atk: 0, hp: 0, def: 0, heal: 0, spRegen: 0, regen: 0 };
  const counts = {};
  for (const id of ids) {
    const d = opData(id);
    if (!d) continue;
    counts[d.cls] = (counts[d.cls] || 0) + 1;
  }
  for (const n of Object.values(counts)) if (n >= 2) buffs.atk += Math.min(0.12, 0.035 * (n - 1));
  if (ids.includes('silverash')) buffs.atk += 0.1;
  if (ids.includes('amiya')) buffs.atk += 0.05;
  if (ids.includes('skadi_alter')) { buffs.hp += 0.12; buffs.regen += 0.005; }
  if (ids.includes('nian')) buffs.def += 0.15;
  if (ids.includes('shu')) buffs.heal += 0.2;
  return buffs;
}

export function squadPower() {
  const ids = state.squad.filter(Boolean);
  const b = getSquadBuffs(ids);
  const raw = ids.reduce((sum, id) => sum + opPower(id), 0);
  return Math.round(raw * (1 + b.atk * 0.55 + b.hp * 0.2 + b.def * 0.15));
}

export function maxEndlessPower() {
  const six = OPERATORS.filter(o => o.rarity === 6).slice(0, MAX_SQUAD);
  if (!six.length) return 0;
  const prevSquad = state.squad.slice();
  const prevOps = new Map();
  for (const o of six) {
    prevOps.set(o.id, state.operators[o.id]);
    state.operators[o.id] = { level: 90, elite: 2, potential: 5, skill: 7, mastery: 3, trust: 100, module: 3, exp: 0 };
  }
  state.squad = six.map(o => o.id);
  const power = squadPower();
  state.squad = prevSquad;
  for (const [id, prev] of prevOps) {
    if (prev) state.operators[id] = prev;
    else delete state.operators[id];
  }
  return power;
}

export function ensureEndlessFloor(n) {
  const floor = Math.max(1, Math.min(MAX_ENDLESS_FLOOR, Math.floor(n)));
  const id = 'endless-' + floor;
  if (STAGE_BY_ID.has(id)) return STAGE_BY_ID.get(id);
  const stage = makeEndlessStage(floor);
  STAGES.push(stage);
  STAGE_BY_ID.set(stage.id, stage);
  return stage;
}

export function baseLevelPowerGain() {
  const before = maxEndlessPower();
  const levels = new Map();
  for (const r of ROOMS) {
    if (r.id === 'control') continue; // crit is capped and excluded from power
    const s = state.base.rooms[r.id];
    levels.set(r.id, s.level);
    s.level += 1;
  }
  const after = maxEndlessPower();
  for (const [id, level] of levels) state.base.rooms[id].level = level;
  return Math.max(0, after - before);
}

export function nextLevelInfo(id) {
  const d = opData(id); const s = opState(id);
  if (!d || !s) return null;
  const cap = levelCap(d.rarity, s.elite);
  if (s.level >= cap) return { capped: true, cap };
  return { capped: false, cap, exp: Math.max(0, expNeeded(s.level, d.rarity) - (s.exp || 0)), lmd: levelLmd(s.level, d.rarity), needExp: expNeeded(s.level, d.rarity) };
}

function consumeRecords(amount) {
  let remaining = amount;
  let got = 0;
  const used = {};
  for (const id of RECORD_ORDER) {
    const per = MATERIALS[id].exp;
    while (remaining > 0 && itemCount(id) > 0) {
      takeItem(id, 1);
      remaining -= per;
      got += per;
      used[id] = (used[id] || 0) + 1;
    }
    if (remaining <= 0) break;
  }
  return { got, used };
}

export function levelUp(id, times = 1) {
  const d = opData(id); const s = opState(id);
  if (!d || !s) return 0;
  let gained = 0;
  for (let i = 0; i < times; i++) {
    const cap = levelCap(d.rarity, s.elite);
    if (s.level >= cap) break;
    const need = expNeeded(s.level, d.rarity);
    const cost = levelLmd(s.level, d.rarity);
    if (state.lmd < cost) break;
    if ((s.exp || 0) < need) {
      const before = s.exp || 0;
      const res = consumeRecords(need - before);
      if (res.got <= 0) break;
      s.exp = before + res.got;
    }
    if ((s.exp || 0) < need) break;
    state.lmd -= cost;
    s.exp -= need;
    s.level += 1;
    gained += 1;
    state.daily.levels += 1;
    state.stats.levels += 1;
  }
  if (gained) {
    saveNow();
    bus.dispatchEvent(new CustomEvent('operator-change', { detail: { id, kind: 'level', gained } }));
  }
  return gained;
}

export function classChipKey() { return 'chip'; }
export function classPackKey() { return 'chip_pack'; }

export function promotionInfo(id) {
  const d = opData(id); const s = opState(id);
  if (!d || !s) return null;
  const max = maxElite(d.rarity);
  if (s.elite >= max) return { maxed: true };
  const cap = levelCap(d.rarity, s.elite);
  if (s.level < cap) return { locked: true, needLevel: cap };
  const next = s.elite + 1;
  const cost = next === 1
    ? { lmd: 7000 + d.rarity * 1800, items: { [classChipKey(d.cls)]: 3 } }
    : { lmd: 22000 + d.rarity * 5000, items: { [classPackKey(d.cls)]: 4 } };
  return { maxed: false, next, cost, cap };
}

export function promote(id) {
  const info = promotionInfo(id);
  if (!info || info.maxed || info.locked) return false;
  if (!pay(info.cost)) return false;
  const s = opState(id);
  s.elite += 1;
  state.stats.promotions += 1;
  saveNow();
  bus.dispatchEvent(new CustomEvent('operator-change', { detail: { id, kind: 'promote' } }));
  return true;
}

const SKILL_REQS = [
  null,
  { lmd: 1800, items: { book1: 2 } },
  { lmd: 2600, items: { book1: 3 } },
  { lmd: 4200, items: { book2: 2 } },
  { lmd: 6400, items: { book2: 3 } },
  { lmd: 9600, items: { book2: 4 } },
  { lmd: 15000, items: { book3: 2 } },
];
const MASTERY_REQS = [
  null,
  { lmd: 26000, items: { book3: 3 } },
  { lmd: 42000, items: { book3: 5 } },
  { lmd: 68000, items: { book3: 7 } },
];

export function skillReqInfo(id) {
  const d = opData(id); const s = opState(id);
  if (!d || !s) return null;
  if (s.skill < 7) return { kind: 'skill', next: s.skill + 1, cost: SKILL_REQS[s.skill] };
  if (s.mastery < 3) {
    if (s.elite < 2) return { locked: true, needElite: 2, next: 'M' + (s.mastery + 1) };
    return { kind: 'mastery', next: 'M' + (s.mastery + 1), cost: MASTERY_REQS[s.mastery] };
  }
  return { maxed: true };
}

export function trainSkill(id) {
  const info = skillReqInfo(id);
  if (!info || info.maxed || info.locked) return false;
  if (!pay(info.cost)) return false;
  const s = opState(id);
  if (info.kind === 'skill') s.skill += 1; else s.mastery += 1;
  saveNow();
  bus.dispatchEvent(new CustomEvent('operator-change', { detail: { id, kind: 'skill' } }));
  return true;
}

export function moduleReqInfo(id) {
  const d = opData(id); const s = opState(id);
  if (!d || !s) return null;
  if (s.elite < 2) return { locked: true, needElite: 2 };
  if ((s.module || 0) >= 3) return { maxed: true };
  const next = (s.module || 0) + 1;
  return { next, cost: { lmd: 9000 * next, items: { module: next + 1 } } };
}

export function upgradeModule(id) {
  const info = moduleReqInfo(id);
  if (!info || info.maxed || info.locked) return false;
  if (!pay(info.cost)) return false;
  opState(id).module = info.next;
  saveNow();
  bus.dispatchEvent(new CustomEvent('operator-change', { detail: { id, kind: 'module' } }));
  return true;
}

export function useToken(id) {
  const s = opState(id);
  if (!s || s.potential >= 5 || itemCount('token') < 1) return false;
  takeItem('token', 1);
  s.potential += 1;
  saveNow();
  bus.dispatchEvent(new CustomEvent('operator-change', { detail: { id, kind: 'potential' } }));
  return true;
}

export function talentText(id) {
  const d = opData(id);
  if (!d) return '';
  if (d.talent) return `${d.talent.name}：${d.talent.desc}`;
  if (d.rarity === 5) return '战术素养：攻击力 +6%。';
  if (d.rarity === 4) return '基础训练：生命上限 +5%。';
  if (d.rarity === 3) return '临战经验：防御力 +4%。';
  return '基础干员：无特殊战斗天赋，但可稳定参与后勤与作战。';
}

// ── 皮肤 ───────────────────────────────────────────────────────────
export function skinsFor(id) { return SKINS_BY_OP[id] || []; }
export function skinOwned(id, skinId) { return !!state.skins.owned[skinId]; }
export function equippedSkin(id) {
  const key = state.skins.equipped[id];
  return key ? SKIN_BY_ID.get(id + '-' + key) : null;
}
export function skinScale(skinId) {
  const v = Number(state.skins.scale?.[skinId]);
  return Number.isFinite(v) ? Math.min(2, Math.max(0.5, v)) : 1;
}
export function skinScaleForOp(opId) {
  const key = state.skins.equipped[opId];
  return skinScale(key ? `${opId}-${key}` : `${opId}-default`);
}
export function setSkinScale(skinId, value) {
  const v = Math.min(2, Math.max(0.5, Number(value) || 1));
  if (!state.skins.scale) state.skins.scale = {};
  state.skins.scale[skinId] = v;
  saveNow();
  bus.dispatchEvent(new CustomEvent('skin-scale', { detail: { skinId, value: v } }));
  return v;
}
export function portraitFor(id) {
  const s = equippedSkin(id);
  return s ? s.img : OP_BY_ID.get(id)?.img;
}
export function buySkin(skinId) {
  const skin = SKIN_BY_ID.get(skinId);
  if (!skin || state.skins.owned[skinId]) return false;
  if (state.primes < SKIN_PRICE) return false;
  state.primes -= SKIN_PRICE;
  state.skins.owned[skinId] = true;
  state.skins.equipped[skin.opId] = skin.key;
  saveNow();
  bus.dispatchEvent(new CustomEvent('skin-change', { detail: { opId: skin.opId, skin } }));
  return true;
}
export function equipSkin(opId, key) {
  if (!key) {
    delete state.skins.equipped[opId];
    saveNow();
    return true;
  }
  const skin = SKIN_BY_ID.get(opId + '-' + key);
  if (!skin || !state.skins.owned[skin.id]) return false;
  state.skins.equipped[opId] = key;
  saveNow();
  bus.dispatchEvent(new CustomEvent('skin-change', { detail: { opId, skin } }));
  return true;
}

export function skillDescription(id) {
  const d = opData(id);
  if (!d) return '';
  if (d.skill.desc) return d.skill.desc;
  const p = Math.round((d.skill.power || 2) * 100);
  switch (d.skill.type) {
    case 'nuke': return `对生命最低的敌人造成 ${p}% 攻击力的伤害。`;
    case 'aoe': return `对范围内所有敌人造成 ${p}% 攻击力的伤害。`;
    case 'multi': return `连续攻击 ${d.skill.hits || 3} 次，每次造成 ${p}% 攻击力的伤害。`;
    case 'heal': return `为生命最低的队友回复 ${p}% 攻击力的生命。`;
    case 'buff': return `全队攻击力 +${Math.round((d.skill.power || 0.2) * 100)}%，持续 ${d.skill.duration || 8} 秒。`;
    case 'shield': return `为自身与周围队友提供护盾，持续 ${d.skill.duration || 6} 秒。`;
    case 'control': return `对范围内敌人造成 ${p}% 伤害，并使其停顿 ${d.skill.duration || 2} 秒。`;
    case 'execute': return `对生命最低的敌人造成 ${p}% 真实伤害。`;
    case 'debuff': return `对范围内敌人造成 ${p}% 伤害，并使其受到伤害 +20%，持续 ${d.skill.duration || 6} 秒。`;
    case 'summon': return `召唤 ${d.skill.count || 1} 个召唤物协同作战，持续 ${d.skill.duration || 12} 秒。`;
    default: return '自动释放的战术技能。';
  }
}

// ── 编队 ───────────────────────────────────────────────────────────
export function setSquadSlot(index, id) {
  if (index < 0 || index >= MAX_SQUAD) return false;
  if (id && !owned(id)) return false;
  if (id) {
    const existing = state.squad.indexOf(id);
    if (existing >= 0) state.squad[existing] = null;
  }
  state.squad[index] = id || null;
  saveNow();
  return true;
}
export function addToSquad(id) {
  if (!owned(id) || state.squad.includes(id)) return false;
  const i = state.squad.indexOf(null);
  if (i < 0) return false;
  state.squad[i] = id;
  saveNow();
  return true;
}
export function removeFromSquad(id) {
  const i = state.squad.indexOf(id);
  if (i >= 0) state.squad[i] = null;
  saveNow();
}
export function autoSquad() {
  const ids = Object.keys(state.operators).sort((a, b) => opPower(b) - opPower(a)).slice(0, MAX_SQUAD);
  state.squad = ids;
  while (state.squad.length < MAX_SQUAD) state.squad.push(null);
  saveNow();
  return ids.length;
}

// ── 关卡 ───────────────────────────────────────────────────────────
export function isStageUnlocked(stage) {
  if (!stage) return false;
  if (stage.group === 'main') {
    const mains = STAGES.filter(s => s.group === 'main');
    const i = mains.findIndex(s => s.id === stage.id);
    return i === 0 || state.stage.cleared.includes(mains[i - 1].id);
  }
  if (stage.group === 'endless') {
    if ((stage.floor || 1) <= 1) return true;
    const prev = STAGES.find(s => s.group === 'endless' && s.floor === stage.floor - 1);
    return !!prev && state.stage.cleared.includes(prev.id);
  }
  if (stage.group === 'annihilation') return true;
  return true;
}
export function setStage(id) {
  const s = STAGE_BY_ID.get(id);
  if (!s || !isStageUnlocked(s)) return false;
  state.stage.selected = id;
  saveNow();
  return true;
}
export function stageIdleRates(stage = STAGE_BY_ID.get(state.stage.selected)) {
  if (!stage?.idle) return { orundumPerHour: 0, shardsPerHour: 0, blocksPerHour: 0, lmdPerHour: 0, expPerHour: 0, chipsPerHour: 0, chipPacksPerHour: 0 };
  return stage.idle;
}

export function idleSummary(stage = STAGE_BY_ID.get(state.stage.selected)) {
  const r = stageIdleRates(stage);
  return {
    chipsPerHour: 0,
    chipPacksPerHour: 0,
    ...r,
    pullsPerHour: r.orundumPerHour / PULL_COST,
    primesPerDay: (r.shardsPerHour * 24) / PRIME_SHARD_COST,
  };
}

export function tickIdle(dt) {
  if (dt <= 0 || !state.stage.auto) return;
  const stage = STAGE_BY_ID.get(state.stage.selected);
  if (!stage) return;
  const r = stageIdleRates(stage);
  state.idle.seconds += dt;
  state.stats.offlineSec += dt;
  state.orundum += (r.orundumPerHour / 3600) * dt;
  state.primeShards += (r.shardsPerHour / 3600) * dt;
  state.lmd += (r.lmdPerHour / 3600) * dt;
  state.idle.exp += (r.expPerHour / 3600) * dt;
  state.idle.blocks += (r.blocksPerHour / 3600) * dt;
  state.idle.chips += ((r.chipsPerHour || 0) / 3600) * dt;
  state.idle.chipPacks += ((r.chipPacksPerHour || 0) / 3600) * dt;
  while (state.primeShards >= PRIME_SHARD_COST) {
    state.primeShards -= PRIME_SHARD_COST;
    state.primes += 1;
  }
  while (state.idle.blocks >= 1) {
    state.idle.blocks -= 1;
    addItem('base_block', 1);
  }
  while (state.idle.exp >= 200) {
    state.idle.exp -= 200;
    addItem('record1', 1);
  }
  while (state.idle.chips >= 1) {
    state.idle.chips -= 1;
    addItem('chip', 1);
  }
  while (state.idle.chipPacks >= 1) {
    state.idle.chipPacks -= 1;
    addItem('chip_pack', 1);
  }
}

export const DOCTOR_DAILY_LEVELS = 5;
export function doctorExpNeeded(level) {
  return Math.round(110 + level * 120 + Math.pow(level, 1.45) * 18);
}
export function doctorTodayLevels() {
  ensureDaily();
  return state.doctor.todayLevels || 0;
}
export function addDoctorExp(n) {
  ensureDaily();
  let ups = 0;
  state.doctor.exp += Math.max(0, n);
  while (state.doctor.todayLevels < DOCTOR_DAILY_LEVELS) {
    const need = doctorExpNeeded(state.doctor.level);
    if (state.doctor.exp < need) break;
    state.doctor.exp -= need;
    state.doctor.level += 1;
    state.doctor.todayLevels += 1;
    ups += 1;
    state.primes += 5;
    state.lmd += 5000;
    state.orundum += 300;
  }
  if (state.doctor.todayLevels >= DOCTOR_DAILY_LEVELS) {
    // Do not bank an unbounded amount of XP past the daily cap.
    state.doctor.exp = Math.min(state.doctor.exp, Math.max(0, doctorExpNeeded(state.doctor.level) - 1));
  }
  return ups;
}

function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function firstClearReward(stage) {
  if (!stage || state.stage.firstClear[stage.id]) return null;
  state.stage.firstClear[stage.id] = true;
  const primes = stage.firstClearPrime || 1;
  state.primes += primes;
  addItem('base_block', 3);
  addItem('record2', 5);
  return { primes, blocks: 3 };
}

export function grantStageRewards(stage, opts = {}) {
  if (!stage) return null;
  const r = stage.rewards;
  const multiplier = opts.multiplier || 1;
  const variance = opts.offline ? 1 : 0.9 + Math.random() * 0.2;
  const grossLmd = Math.floor(r.lmd * variance * multiplier);
  const lmd = Math.max(0, grossLmd - (opts.lmdCredit || 0));
  const orundum = Math.round((r.orundum || 0) * multiplier);
  const items = {};
  const add = (id, n) => { if (id && n > 0) items[id] = (items[id] || 0) + n; };
  // Only resource stages provide items now. Main/annihilation/endless do not
  // drop promotion or skill materials; their rewards are LMD/EXP/prime only.
  if (stage.group === 'resource') {
    for (const [id, n] of Object.entries(r.items || {})) add(id, n * multiplier);
    if (stage.drops?.length) {
      if (Math.random() < 0.88) add(randomOf(stage.drops), 1 + Math.floor(Math.random() * 2));
      if (stage.drops.length > 1 && Math.random() < 0.34) add(randomOf(stage.drops), 1);
    }
  }
  const first = firstClearReward(stage);
  if (stage.id === 'main-R8-11' || stage.id === 'main-14-23') unlockAmiyaForms();
  state.lmd += lmd;
  state.orundum += orundum;
  for (const [id, n] of Object.entries(items)) addItem(id, n);
  const doctorUps = addDoctorExp(r.doctorExp || 8);
  state.stats.runs += 1;
  state.stats.wins += 1;
  state.stats.kills += 8 + (stage.waves || 3) * 4;
  state.stats.battleSeconds += 42;
  state.daily.runs += 1;
  if (stage.group === 'annihilation') state.daily.annihilation += 1;
  for (const id of state.squad.filter(Boolean)) {
    const s = opState(id);
    if (s) s.trust = Math.min(100, s.trust + 0.6);
  }
  if (!opts.silent) saveNow();
  return { lmd, orundum, items, doctorExp: r.doctorExp || 8, doctorUps, first };
}

// ── 抽卡 ───────────────────────────────────────────────────────────
export function bannerState(id) { return state.gacha[id]; }
export function bannerPool(banner) {
  const six = OPERATORS.filter(o => o.rarity === 6);
  const standard6 = six.filter(o => !o.limited && !o.collab);
  if (banner.pool === 'limited') return { featured: six.find(o => o.id === banner.featured6), otherFeatured: six.filter(o => o.limited && o.id !== banner.featured6), standard: six.filter(o => o.limited), six };
  if (banner.pool === 'collab') return { featured: six.find(o => o.id === banner.featured6), otherFeatured: six.filter(o => o.collab && o.id !== banner.featured6), standard: six.filter(o => o.collab), six };
  return { featured: six.find(o => o.id === banner.featured6), otherFeatured: [], standard: standard6, six };
}

function pickFrom(arr) { return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }

function poolFor(rarity, banner) {
  const tagged = (o) => banner.pool === 'limited' ? o.limited : banner.pool === 'collab' ? o.collab : true;
  const standard = OPERATORS.filter(o => o.rarity === rarity && !o.limited && !o.collab && !AMIYA_FORM_IDS.has(o.id));
  if (banner.pool === 'standard') {
    if (rarity === 3) {
      const pool = [...standard, ...OPERATORS.filter(o => o.rarity === 2 && !o.limited && !o.collab)];
      return pool;
    }
    return standard;
  }
  const special = OPERATORS.filter(o => o.rarity === rarity && tagged(o));
  if (special.length) return special;
  if (rarity === 3) {
    const lowSpecial = OPERATORS.filter(o => o.rarity === 2 && tagged(o));
    return [...special, ...lowSpecial, ...standard, ...OPERATORS.filter(o => o.rarity === 2 && !o.limited && !o.collab)];
  }
  return standard;
}

function pickOperator(rarity, banner) {
  const pool = bannerPool(banner);
  if (rarity === 6) {
    if (banner.pool === 'standard') return Math.random() < 0.5 ? pool.featured : pickFrom(pool.standard);
    return pickFrom(pool.standard);
  }
  const candidates = poolFor(rarity, banner);
  return pickFrom(candidates) || pickFrom(OPERATORS.filter(o => o.rarity === Math.max(2, rarity - 1)));
}

function rollRarity(banner, pity) {
  let six = 0.02;
  if (pity.since6 >= 50) six = Math.min(1, 0.02 + (pity.since6 - 49) * 0.02);
  if (pity.since6 >= 98) six = 1;
  const r = Math.random();
  if (r < six) return 6;
  if (r < six + (1 - six) * 0.08) return 5;
  if (r < six + (1 - six) * 0.58) return 4;
  return 3;
}

export function pull(bannerId, count = 1) {
  const banner = BANNERS.find(b => b.id === bannerId);
  if (!banner) return { error: '未知卡池' };
  const cost = PULL_COST * count;
  if (state.orundum < cost) return { error: '合成玉不足', need: cost };
  state.orundum -= cost;
  const pity = state.gacha[bannerId];
  const local = { since6: pity.since6, since5: pity.since5 };
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const rarity = rollRarity(banner, local);
    rolls.push({ rarity });
    if (rarity === 6) { local.since6 = 0; local.since5 = 0; }
    else { local.since6 += 1; local.since5 += 1; }
    if (rarity === 5) local.since5 = 0;
  }
  if (count === 10 && !rolls.some(x => x.rarity >= 5)) {
    rolls[9].rarity = 5;
    local.since5 = 0;
  }
  const results = [];
  for (const roll of rolls) {
    const op = pickOperator(roll.rarity, banner);
    const existed = owned(op.id);
    let potentialUp = false;
    let maxed = false;
    if (existed) {
      const s = opState(op.id);
      if (s.potential < 5) { s.potential += 1; potentialUp = true; }
      else maxed = true;
    } else {
      ensureOp(op.id);
    }
    const cert = { 6: 10, 5: 5, 4: 2, 3: 1 }[op.rarity] || 1;
    state.distinction += cert + (maxed ? op.rarity * 5 : 0);
    results.push({ op, rarity: op.rarity, isNew: !existed, potentialUp, maxed, cert });
  }
  pity.since6 = local.since6;
  pity.since5 = local.since5;
  pity.total += count;
  if (banner.spark) pity.spark += count;
  state.gacha.totalPulls += count;
  state.stats.pulls += count;
  state.daily.pulls += count;
  state.gacha.history.unshift(...results.map(r => ({ id: r.op.id, rarity: r.rarity, at: Date.now(), banner: banner.id })));
  state.gacha.history = state.gacha.history.slice(0, 80);
  saveNow();
  bus.dispatchEvent(new CustomEvent('gacha', { detail: { banner, results } }));
  return { results, banner, cost };
}

export function selectorsAvailable() {
  return Math.max(0, Math.floor(state.gacha.totalPulls / SELECTOR_COST) - (state.gacha.selectorsUsed || 0));
}
export function selectorProgress() {
  const used = (state.gacha.selectorsUsed || 0) * SELECTOR_COST;
  return { current: state.gacha.totalPulls - used, need: SELECTOR_COST, available: selectorsAvailable() };
}
export function claimSixStarSelector(opId) {
  if (selectorsAvailable() <= 0) return null;
  const op = OP_BY_ID.get(opId);
  if (!op || op.rarity !== 6) return null;
  const existed = owned(opId);
  let maxed = false;
  if (existed) {
    const s = opState(opId);
    if (s.potential < 5) s.potential += 1;
    else { maxed = true; state.distinction += 30; }
  } else {
    ensureOp(opId);
  }
  state.gacha.selectorsUsed = (state.gacha.selectorsUsed || 0) + 1;
  saveNow();
  bus.dispatchEvent(new CustomEvent('selector', { detail: { op, isNew: !existed, maxed } }));
  return { op, isNew: !existed, maxed };
}

// ── 基建 ───────────────────────────────────────────────────────────
export function roomState(id) { return state.base.rooms[id]; }
export function roomDef(id) { return ROOMS.find(r => r.id === id); }
export function globalMultiplier() {
  let m = 1;
  for (const r of ROOMS) {
    if ((r.effect === 'global') && !state.base.rooms[r.id].damaged) m += r.rate * (state.base.rooms[r.id].level - 1);
  }
  return m;
}
export function repairDiscount() {
  const d = state.base.rooms.dorm;
  return d.damaged ? 0 : Math.min(0.35, (d.level - 1) * 0.05);
}
export function roomRate(id) {
  const r = roomDef(id); const s = state.base.rooms[id];
  if (!r || !s || s.damaged) return 0;
  const levelMul = 1 + 0.12 * (s.level - 1);
  const g = globalMultiplier();
  if (r.effect === 'lmd') return r.rate * levelMul * g;
  if (r.effect === 'record') return r.rate * levelMul * g;
  if (r.effect === 'block') return r.rate * levelMul * g;
  if (r.effect === 'material') return r.rate * levelMul * g;
  if (r.effect === 'book') return r.rate * levelMul * g;
  return 0;
}

export function getBaseBonuses() {
  const lv = (id) => state.base.rooms[id]?.damaged ? 0 : (state.base.rooms[id]?.level || 0);
  return {
    crit: Math.min(1, 0.05 + lv('control') * 0.0005),
    critDmg: 1.5 + lv('trade') * 0.001,
    atk: lv('factory') * 0.0006,
    aspd: lv('power') * 0.0003,
    heal: lv('reception') * 0.0004 + lv('workshop') * 0.0003 + lv('training') * 0.0008,
    hp: lv('dorm') * 0.0008,
  };
}

export function baseSummary() {
  const lmd = roomRate('trade');
  const record = roomRate('factory');
  const block = roomRate('reception');
  const material = roomRate('workshop');
  const book = roomRate('training');
  return {
    lmdPerHour: lmd * 3600, recordPerHour: record * 3600, blockPerHour: block * 3600,
    materialPerHour: material * 3600, bookPerHour: book * 3600,
    global: globalMultiplier(), repairDiscount: repairDiscount(),
    damaged: ROOMS.filter(r => state.base.rooms[r.id].damaged).length,
    bonuses: getBaseBonuses(),
  };
}
export function roomUpgradeCost(id) {
  const r = roomDef(id); const s = state.base.rooms[id];
  if (!r || !s) return null;
  const step = s.level - 1;
  return {
    // Linear growth keeps long-run base costs in the same order of magnitude as
    // base/endless income instead of exploding past the player's hourly rate.
    lmd: Math.floor(r.baseCost * (1 + 0.18 * step)),
    items: { base_block: Math.max(1, Math.ceil(1 + step * 0.14)) },
  };
}
export function canUpgradeRoom(id) {
  if (id === 'control' && state.base.rooms.control.level >= CONTROL_MAX_LEVEL) return false;
  return true;
}

export function upgradeRoom(id) {
  if (!canUpgradeRoom(id)) return false;
  const info = roomUpgradeCost(id);
  if (!info || !pay(info)) return false;
  state.base.rooms[id].level += 1;
  saveNow();
  bus.dispatchEvent(new CustomEvent('base-change', { detail: { id, action: 'upgrade' } }));
  return true;
}
export function repairCost(id) {
  const r = roomDef(id); const s = state.base.rooms[id];
  if (!r || !s) return 0;
  // Fixed emergency repair fee for a W-sabotaged facility.
  return 30000;
}
export function repairRoom(id) {
  const s = state.base.rooms[id];
  if (!s?.damaged) return false;
  const cost = repairCost(id);
  if (state.lmd < cost) return false;
  state.lmd -= cost;
  s.damaged = false;
  state.stats.repairs += 1;
  state.daily.repairs += 1;
  saveNow();
  bus.dispatchEvent(new CustomEvent('base-change', { detail: { id, action: 'repair' } }));
  return true;
}
export function repairAll() {
  const damaged = ROOMS.filter(r => state.base.rooms[r.id].damaged);
  const total = damaged.reduce((sum, r) => sum + repairCost(r.id), 0);
  if (!damaged.length || state.lmd < total) return { ok: false, total };
  for (const r of damaged) {
    state.lmd -= repairCost(r.id);
    state.base.rooms[r.id].damaged = false;
  }
  state.stats.repairs += damaged.length;
  state.daily.repairs += damaged.length;
  saveNow();
  bus.dispatchEvent(new CustomEvent('base-change', { detail: { action: 'repair-all' } }));
  return { ok: true, total, count: damaged.length };
}
export function rollSabotage(force = false) {
  const rooms = ROOMS.filter(r => !state.base.rooms[r.id].damaged);
  if (!rooms.length) return null;
  const ownedWis = owned('wisadel');
  const inSquad = state.squad.includes('wisadel');
  const chance = 0.006 + (ownedWis ? 0.004 : 0) + (inSquad ? 0.003 : 0);
  if (!force && Math.random() >= chance) return null;
  const room = rooms[Math.floor(Math.random() * rooms.length)];
  state.base.rooms[room.id].damaged = true;
  state.base.sabotageCount += 1;
  state.base.lastEventAt = Date.now();
  const entry = { id: room.id, name: room.name, at: Date.now(), cost: repairCost(room.id), source: ownedWis ? (inSquad ? '维什戴尔（编队中）' : '维什戴尔') : '不明爆炸物' };
  state.base.sabotageLog.unshift(entry);
  state.base.sabotageLog = state.base.sabotageLog.slice(0, 12);
  saveNow();
  bus.dispatchEvent(new CustomEvent('sabotage', { detail: { room, entry } }));
  return { room, entry };
}
export function tickBase(dt, opts = {}) {
  if (dt <= 0) return;
  const s = state.base;
  s.expPool += roomRate('factory') * dt;
  while (s.expPool >= 200) { s.expPool -= 200; addItem('record1', 1); }
  s.materialProgress += roomRate('workshop') * dt;
  while (s.materialProgress >= 1) {
    s.materialProgress -= 1;
    addItem(Math.random() < 0.25 ? 'book2' : 'book1', 1);
  }
  s.bookProgress += roomRate('training') * dt;
  while (s.bookProgress >= 1) {
    s.bookProgress -= 1;
    addItem(Math.random() < 0.22 ? 'book2' : 'book1', 1);
  }
  s.blockProgress = (s.blockProgress || 0) + roomRate('reception') * dt;
  while (s.blockProgress >= 1) {
    s.blockProgress -= 1;
    addItem('base_block', 1);
  }
  state.lmd += roomRate('trade') * dt;
  if (!opts.offline) {
    s.sabotageTimer += dt;
    if (s.sabotageTimer >= 120) {
      s.sabotageTimer -= 120;
      rollSabotage();
    }
  }
}

// ── 每日与商店 ─────────────────────────────────────────────────────
export function ensureDaily() {
  const today = dateKey();
  if (state.daily.date !== today) {
    state.daily = { date: today, runs: 0, pulls: 0, levels: 0, repairs: 0, annihilation: 0, claimed: [], supplyClaimed: false };
  }
  if (!state.doctor) state.doctor = { name: '博士', level: 1, exp: 0, todayLevels: 0, todayDate: today };
  if (typeof state.doctor.todayLevels !== 'number') state.doctor.todayLevels = 0;
  if (state.doctor.todayDate !== today) {
    state.doctor.todayDate = today;
    state.doctor.todayLevels = 0;
  }
}
function ensureRandomEvent(now = Date.now()) {
  if (!state.randomEvent || typeof state.randomEvent !== 'object') state.randomEvent = { nextAt: 0, log: [] };
  if (!Array.isArray(state.randomEvent.log)) state.randomEvent.log = [];
  if (!state.randomEvent.nextAt) state.randomEvent.nextAt = now + (5 + Math.random() * 2) * 3600e3;
}

function randomEventResult(event) {
  const n = event.amount || 0;
  if (event.kind === 'lmd') {
    state.lmd += n;
    return `获得 ${n.toLocaleString('zh-CN')} 龙门币`;
  }
  if (event.kind === 'primes') {
    state.primes += n;
    return `获得 ${n} 源石`;
  }
  if (event.kind === 'item') {
    addItem(event.item, n);
    return `获得 ${MATERIALS[event.item]?.name || event.item} ×${n}`;
  }
  if (event.kind === 'fine') {
    const paid = Math.min(state.lmd, n);
    state.lmd -= paid;
    return `支出 ${paid.toLocaleString('zh-CN')} 龙门币`;
  }
  if (event.kind === 'damage') {
    const rooms = ROOMS.filter(r => !state.base.rooms[r.id].damaged);
    if (!rooms.length) {
      const paid = Math.min(state.lmd, 15000);
      state.lmd -= paid;
      return `设施已全部受损，紧急处理支出 ${paid.toLocaleString('zh-CN')} 龙门币`;
    }
    const room = rooms.find(r => r.id === event.room) || rooms[Math.floor(Math.random() * rooms.length)];
    state.base.rooms[room.id].damaged = true;
    state.base.sabotageCount += 1;
    const entry = { id: room.id, name: room.name, at: Date.now(), cost: repairCost(room.id), source: `随机事件：${event.title}` };
    state.base.sabotageLog.unshift(entry);
    state.base.sabotageLog = state.base.sabotageLog.slice(0, 12);
    return `${room.name} 受损，维修预计 ${repairCost(room.id).toLocaleString('zh-CN')} 龙门币`;
  }
  return '没有发生额外变化';
}

export function checkRandomEvent(now = Date.now()) {
  ensureRandomEvent(now);
  if (now < state.randomEvent.nextAt) return null;
  state.randomEvent.nextAt = now + (5 + Math.random() * 2) * 3600e3;
  if (Math.random() >= 0.15) { saveNow(); return null; }
  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  const result = randomEventResult(event);
  const entry = { id: event.id, title: event.title, text: event.text, tone: event.tone, operator: event.operator || '罗德岛', kind: event.kind || 'neutral', result, at: now };
  state.randomEvent.log.unshift(entry);
  state.randomEvent.log = state.randomEvent.log.slice(0, 120);
  saveNow();
  bus.dispatchEvent(new CustomEvent('random-event', { detail: { event, result, entry } }));
  return { event, result, entry };
}

export function ensureShop() {
  const today = dateKey();
  if (state.shop.date !== today) {
    state.shop = { date: today, stock: Object.fromEntries(SHOP_ITEMS.map(i => [i.id, i.stock])) };
  }
}
export function taskProgress(task) {
  return Math.min(task.target, state.daily[task.metric] || 0);
}
export function claimTask(id) {
  ensureDaily();
  const task = DAILY_TASKS.find(t => t.id === id);
  if (!task || state.daily.claimed.includes(id) || taskProgress(task) < task.target) return false;
  state.daily.claimed.push(id);
  if (task.rewards.lmd) state.lmd += task.rewards.lmd;
  if (task.rewards.orundum) state.orundum += task.rewards.orundum;
  for (const [iid, n] of Object.entries(task.rewards.items || {})) addItem(iid, n);
  saveNow();
  return true;
}
export function claimDailySupply() {
  ensureDaily();
  if (state.daily.supplyClaimed) return false;
  state.daily.supplyClaimed = true;
  state.lmd += 10000;
  state.orundum += 300;
  addItem('record2', 8);
  addItem('book1', 3);
  saveNow();
  return true;
}
export function buyShop(id) {
  ensureShop();
  const item = SHOP_ITEMS.find(i => i.id === id);
  if (!item) return false;
  const stock = state.shop.stock[id] ?? 0;
  if (stock <= 0 || state.distinction < item.cost) return false;
  state.distinction -= item.cost;
  state.shop.stock[id] = stock - 1;
  addItem(id, item.qty);
  saveNow();
  return true;
}

// ── 离线结算 ───────────────────────────────────────────────────────
export function applyOffline(now = Date.now()) {
  const elapsed = Math.max(0, (now - (state.lastSeen || now)) / 1000);
  const capped = Math.min(elapsed, OFFLINE_CAP_HOURS * 3600);
  if (capped < 60) { state.lastSeen = now; return null; }
  const stage = STAGE_BY_ID.get(state.stage.selected);
  const idle = idleSummary(stage);
  const before = {
    lmd: state.lmd, orundum: state.orundum, primes: state.primes, shards: state.primeShards,
    items: { ...state.inventory },
  };
  tickBase(capped, { offline: true });
  tickIdle(capped);
  state.lastSeen = now;
  const items = {};
  for (const [id, n] of Object.entries(state.inventory)) {
    const diff = n - (before.items[id] || 0);
    if (diff > 0.5) items[id] = Math.floor(diff);
  }
  saveNow();
  return {
    seconds: capped,
    capped: elapsed > capped,
    stage,
    idle,
    lmd: state.lmd - before.lmd,
    orundum: state.orundum - before.orundum,
    primes: state.primes - before.primes,
    shards: (state.primes - before.primes) * PRIME_SHARD_COST + (state.primeShards - before.shards),
    pulls: (state.orundum - before.orundum) / PULL_COST,
    items,
  };
}
