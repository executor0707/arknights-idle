import { OPERATORS } from './operators.js';
import {
  STAGES, STAGE_GROUPS, BANNERS, MATERIALS, CLASSES, CLASS_GLYPH, CLASS_COLOR,
  STAR_COLOR, ROOMS, DAILY_TASKS, SHOP_ITEMS, SKIN_PRICE, PRIME_SHARD_COST,
  SELECTOR_COST, PULL_COST, OFFLINE_CAP_HOURS, SAVE_KEY, MAIN_CHAPTERS,
} from './data.js';
import { SKINS, SKINS_BY_OP, SKIN_BY_ID } from './skins.js';
import * as G from './game.js';
import { state } from './game.js';
import { sfx, initAudio } from './audio.js';
import { initSpineArena, syncSpine, isOperatorSpineReady, isEnemySpineReady } from './spine-battle.js';
import { encryptSave, decodeSaveFile } from './save-codec.js';

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => {
  n = Number(n) || 0;
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e5) return (n / 1e4).toFixed(1) + '万';
  if (Math.abs(n) >= 1e4) return (n / 1e4).toFixed(2) + '万';
  return Math.floor(n).toLocaleString('zh-CN');
};
const fmt1 = (n) => (Number(n) || 0).toFixed(1);
const exact = (n) => Math.floor(Number(n) || 0).toLocaleString('zh-CN');
const stars = (n) => '<span class="stars">' + '★'.repeat(n) + '</span>';
const pct = (n, d = 1) => (n * 100).toFixed(d) + '%';
const clock = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
const timeAgo = (t) => {
  const m = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (m < 1) return '刚刚';
  if (m < 60) return m + ' 分钟前';
  return Math.floor(m / 60) + ' 小时前';
};
const classOf = (d) => CLASS_COLOR[d.cls] || '#aaa';

const NAV = [
  { view: 'battle', glyph: '⌖', label: '作战', sub: 'OPERATION' },
  { view: 'operators', glyph: '◈', label: '干员', sub: 'OPERATORS' },
  { view: 'gacha', glyph: '✦', label: '寻访', sub: 'HEADHUNT' },
  { view: 'skins', glyph: '◇', label: '时装', sub: 'SKINS' },
  { view: 'base', glyph: '▦', label: '基建', sub: 'BASE' },
  { view: 'inventory', glyph: '▤', label: '仓库', sub: 'DEPOT' },
  { view: 'archive', glyph: '⚙', label: '设置', sub: 'SETTINGS' },
  { view: 'events', glyph: '▣', label: '事件', sub: 'INCIDENTS' },
];

let battle = null;
const ui = {
  view: 'battle',
  stageGroup: 'resource',
  mainChapter: 0,
  filter: { rarity: 0, cls: 'all', owned: false, sort: 'rarity' },
  eventFilter: { range: 'all', operator: 'all', outcome: 'all' },
  squadDirty: false,
  skinFilter: { cls: 'all', owned: false, q: '' },
  bannerId: 'limited',
  invTab: 'all',
  galleryOwned: false,
  arena: null,
  renderedRun: -1,
  resultKey: '',
  chromeTimer: 0,
  tutorialStep: 0,
  pullOverlay: null,
  deploying: null,
  gridVisible: false,
  showRanges: false,
  log: [],
};

// ── shell ─────────────────────────────────────────────────────────
export function initUI(battleInstance) {
  battle = battleInstance;
  ui.stageGroup = G.STAGE_BY_ID.get(state.stage.selected)?.group || 'resource';
  renderNav();
  bindEvents();
  setView('battle', true);
  updateChrome();
  battle.setCallback((res) => {
    if (res.win && res.reward?.first) {
      toast(`首通奖励：源石 ×${res.reward.first.primes} · 基建材料块 ×${res.reward.first.blocks}`, 'success');
      sfx('gold');
    }
    if (!res.win && !res.retreat) ui.log.unshift({ tone: 'bad', text: `${res.stage.code} 作战失败 · ${res.reason}` });
    if (res.reward?.doctorUps) toast(`博士等级 +${res.reward.doctorUps}，源石 +${res.reward.doctorUps * 5}`, 'success');
    if (res.win) ui.log.unshift({ tone: 'good', text: `${res.stage.code} 作战完成 · 合成玉 +${res.reward?.orundum || 0}` });
    ui.log = ui.log.slice(0, 8);
    updateChrome();
    if (ui.view === 'battle') {
      setTimeout(() => { if (ui.view === 'battle' && !$('#pullOverlay')) renderView(); }, 140);
    }
  });
  G.bus.addEventListener('notice', e => toast(e.detail.text, e.detail.tone));
  G.bus.addEventListener('lmd-change', () => updateChrome());
  G.bus.addEventListener('battle-sfx', e => sfx(e.detail.sound));
  G.bus.addEventListener('battle-end', e => {
    if (e.detail.win) updateChrome();
  });
  G.bus.addEventListener('random-event', e => showRandomEvent(e.detail));
  G.bus.addEventListener('battle-start', e => {
    const s = e.detail?.stage;
    if (!s) return;
    ui.stageGroup = s.group;
    if (s.group === 'main') ui.mainChapter = s.chapterKey;
    if (ui.view === 'battle') setTimeout(() => { if (ui.view === 'battle') renderView(); }, 0);
  });
  G.bus.addEventListener('sabotage', e => showSabotage(e.detail));
  window.addEventListener('unhandledrejection', e => console.error(e.reason));
}

function renderNav() {
  const nav = $('#sidebar');
  nav.innerHTML = NAV.map(n => `
    <button class="nav-item" data-action="view" data-view="${n.view}" data-nav="${n.view}">
      <span class="nav-glyph">${n.glyph}</span>
      <span class="nav-label">${n.label}</span>
      <span class="nav-sub">${n.sub}</span>
      <i class="nav-badge hidden" data-badge="${n.view}"></i>
    </button>`).join('') + `<div class="sidebar-foot">PRTS LINK<br><b>ONLINE</b><br>v1.0.0</div>`;
}

function bindEvents() {
  document.addEventListener('click', onClick);
  document.addEventListener('change', (e) => {
    const scaleInput = e.target.closest('[data-skin-scale]');
    if (scaleInput) {
      battle?.start(state.stage.selected);
      return;
    }
    const ef = e.target.closest('[data-event-filter]');
    if (ef) {
      ui.eventFilter[ef.dataset.eventFilter] = ef.value;
      renderView();
      return;
    }
    const sel = e.target.closest('[data-action="chapter-select"]');
    if (sel) {
      ui.mainChapter = sel.value;
      renderView();
      requestAnimationFrame(() => document.querySelector('.stage-card.active')?.scrollIntoView({ block: 'nearest' }));
    }
  });
  document.addEventListener('input', (e) => {
    const skinScaleInput = e.target.closest('[data-skin-scale]');
    if (skinScaleInput) {
      const id = skinScaleInput.dataset.skinScale;
      const pct = Math.round(Number(skinScaleInput.value) || 100);
      G.setSkinScale(id, pct / 100);
      const row = skinScaleInput.closest('.skin-scale-row');
      if (row) { const label = row.querySelector('b'); if (label) label.textContent = pct + '%'; }
      return;
    }
    if (e.target.id === 'charScale' || e.target.id === 'enemyScale') {
      const key = e.target.id === 'charScale' ? 'characterScale' : 'enemyScale';
      const fallback = key === 'characterScale' ? 1.2 : 1;
      const v = Math.min(2, Math.max(0.5, Number(e.target.value) || fallback));
      state.settings[key] = v;
      const label = e.target.id === 'charScale' ? $('#charScaleValue') : $('#enemyScaleValue');
      if (label) label.textContent = Math.round(v * 100) + '%';
      G.saveNow();
      return;
    }
    if (e.target.id === 'skinSearch') {
      ui.skinFilter.q = e.target.value;
      renderView();
      requestAnimationFrame(() => {
        const input = document.getElementById('skinSearch');
        if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
      });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (ui.pullOverlay) closePullOverlay();
      else if ($('#modalRoot').children.length) closeModal();
      else if (battle?.paused) { battle.togglePause(); syncArena(); }
    }
  });
  $('#modalRoot').addEventListener('click', (e) => {
    if (e.target.id === 'modalRoot' || e.target.classList.contains('modal-backdrop')) closeModal();
  });
  const fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'application/json'; fileInput.id = 'saveImport'; fileInput.className = 'hidden';
  document.body.appendChild(fileInput);
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const parsed = JSON.parse(text);
      const data = await decodeSaveFile(parsed);
      window.__RHODES_IMPORTING__ = true;
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      toast('存档已导入，正在重载...', 'success');
      setTimeout(() => location.reload(), 700);
    } catch (e) { toast('存档导入失败：格式错误或文件已损坏', 'error'); }
    fileInput.value = '';
  });
}

export function setView(view, force = false) {
  if (!NAV.some(n => n.view === view)) return;
  if (!force && ui.view === view) { refreshView(); return; }
  closeModal(true);
  ui.view = view;
  if (view === 'battle') {
    const cur = G.STAGE_BY_ID.get(state.stage.selected);
    ui.stageGroup = cur?.group || ui.stageGroup;
    if (cur?.group === 'main') ui.mainChapter = cur.chapterKey;
  }
  renderView();
  updateNav();
  updateChrome();
  const main = $('#view');
  if (main) main.scrollTop = 0;
  if (view === 'battle') requestAnimationFrame(() => $('#view')?.scrollTo({ top: 0, behavior: 'instant' }));
}

function updateNav() {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === ui.view));
  const damaged = ROOMS.filter(r => state.base.rooms[r.id].damaged).length;
  const baseBadge = document.querySelector('[data-badge="base"]');
  if (baseBadge) baseBadge.classList.toggle('hidden', damaged === 0);
  const gachaBadge = document.querySelector('[data-badge="gacha"]');
  if (gachaBadge) gachaBadge.classList.toggle('hidden', G.selectorsAvailable() === 0);
  const opBadge = document.querySelector('[data-badge="operators"]');
  if (opBadge) opBadge.classList.toggle('hidden', true);
}

export function updateChrome() {
  const set = (id, text, title) => { const n = document.getElementById(id); if (n) { n.textContent = text; if (title) n.title = title; } };
  set('resLmd', fmt(state.lmd), exact(state.lmd) + ' 龙门币');
  set('resOrundum', fmt(state.orundum), exact(state.orundum) + ' 合成玉 · 约 ' + (state.orundum / PULL_COST).toFixed(1) + ' 抽');
  set('resPrime', fmt(state.primes), `${exact(state.primes)} 源石 · 碎片 ${Math.floor(state.primeShards)}/${PRIME_SHARD_COST}`);
  set('resCert', fmt(state.distinction), exact(state.distinction) + ' 资质凭证');
  set('doctorLevel', state.doctor.level);
  const need = G.doctorExpNeeded(state.doctor.level);
  const bar = $('#doctorExpBar');
  if (bar) bar.style.width = Math.min(100, state.doctor.exp / need * 100) + '%';
  const dot = $('#taskDot');
  const claimable = DAILY_TASKS.some(t => !state.daily.claimed.includes(t.id) && G.taskProgress(t) >= t.target) || !state.daily.supplyClaimed;
  if (dot) dot.classList.toggle('hidden', !claimable);
  const sound = $('#soundIcon');
  if (sound) { sound.textContent = state.settings.sound ? '♪' : '×'; sound.style.color = state.settings.sound ? '' : 'var(--dim)'; }
  updateNav();
}

function refreshView() {
  if (!ui.view) return;
  renderView();
  updateNav();
  updateChrome();
}

function pageHead(kicker, title, right = '') {
  return `<div class="page-head">
    <div><div class="eyebrow">${kicker}</div><h2>${title}</h2></div>
    <div class="page-head-right">${right}</div>
  </div>`;
}

function statHead(label, value, suffix = '') {
  return `<div class="page-head-stat"><b>${value}${suffix}</b><span>${label}</span></div>`;
}

function renderView() {
  const main = $('#view');
  if (!main) return;
  let html = '';
  if (ui.view === 'battle') html = renderBattle();
  else if (ui.view === 'operators') html = renderOperators();
  else if (ui.view === 'gacha') html = renderGacha();
  else if (ui.view === 'skins') html = renderSkins();
  else if (ui.view === 'base') html = renderBase();
  else if (ui.view === 'inventory') html = renderInventory();
  else if (ui.view === 'archive') html = renderArchive();
  else if (ui.view === 'events') html = renderEvents();
  main.innerHTML = html;
  if (ui.view === 'battle') setupArena();
  if (ui.view === 'base') updateBaseDynamic();
}

// ── toasts / modal ────────────────────────────────────────────────
export function toast(text, tone = 'info', ms = 3200) {
  const root = $('#toastRoot');
  if (!root) return;
  const t = el('div', 'toast ' + tone, `<span>${esc(text)}</span>`);
  root.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, ms);
}

function modalShell(title, body, opts = {}) {
  const sub = opts.sub ? `<p>${opts.sub}</p>` : '';
  const actions = opts.actions ? `<div class="modal-actions">${opts.actions}</div>` : '';
  return `<div class="modal-backdrop">
    <div class="modal ${opts.wide ? 'wide' : ''} ${opts.narrow ? 'narrow' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div><div class="eyebrow">${opts.kicker || 'RHODES ISLAND'}</div><h3>${title}</h3>${sub}</div>
        <button class="modal-close" data-action="modal-close" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">${body}</div>
      ${actions}
    </div>
  </div>`;
}

function openModal(html, opts = {}) {
  const root = $('#modalRoot');
  const wasOpen = !!root.children.length;
  const oldBody = root.querySelector('.modal-body');
  const scrollTop = oldBody?.scrollTop || 0;
  root.innerHTML = html;
  if (wasOpen) {
    root.querySelector('.modal-backdrop')?.classList.add('no-anim');
    root.querySelector('.modal')?.classList.add('no-anim');
  }
  document.body.classList.add('modal-open');
  if (scrollTop) {
    requestAnimationFrame(() => {
      const body = root.querySelector('.modal-body');
      if (body) body.scrollTop = scrollTop;
    });
  }
  if (!opts.silent) sfx('open');
}
function closeModal(silent = false) {
  const root = $('#modalRoot');
  if (!root?.children.length) return;
  root.innerHTML = '';
  document.body.classList.remove('modal-open');
  if (!silent) sfx('close');
  if (ui.view) { renderView(); }
  if (ui.squadDirty) {
    ui.squadDirty = false;
    battle?.start(state.stage.selected);
  }
}

// ── battle view ───────────────────────────────────────────────────
function renderBattle() {
  let stage = G.STAGE_BY_ID.get(state.stage.selected) || STAGES[0];
  if (!ui.stageGroup) ui.stageGroup = stage.group;
  const allGroupStages = STAGES.filter(s => s.group === ui.stageGroup);
  const endlessCurrent = allGroupStages.reduce((a, b) => !a || b.floor > a.floor ? b : a, null);
  if (ui.stageGroup === 'endless') {
    // Prefer the stage the battle is actually on. ensureEndlessFloor() creates
    // the next stage before the result overlay closes, so max(floor) would
    // spoil the next label while the current result is still on screen.
    stage = battle?.stage?.group === 'endless' ? battle.stage : endlessCurrent || stage;
  }
  const power = G.squadPower();
  const idle = G.idleSummary(stage);
  if (ui.stageGroup === 'main' && !allGroupStages.some(s => String(s.chapterKey) === String(ui.mainChapter))) {
    ui.mainChapter = stage.group === 'main' ? stage.chapterKey : allGroupStages[0]?.chapterKey || 0;
  }
  const stages = ui.stageGroup === 'endless' ? [stage].filter(Boolean) : ui.stageGroup === 'main' ? allGroupStages.filter(s => String(s.chapterKey) === String(ui.mainChapter)) : allGroupStages;
  const chapters = [...new Map(STAGES.filter(s => s.group === 'main').map(s => [String(s.chapterKey), s])).values()];
  const selectedGroup = STAGE_GROUPS.find(g => g.id === ui.stageGroup);
  const ratio = power / stage.rec;
  const estimate = ratio >= 1.22 ? ['优', 'green'] : ratio >= 0.98 ? ['稳', 'green'] : ratio >= 0.82 ? ['险', 'warn'] : ['危', 'bad'];
  const squadCount = state.squad.filter(Boolean).length;
  const damaged = ROOMS.filter(r => state.base.rooms[r.id].damaged);
  const taskList = DAILY_TASKS.filter(t => !state.daily.claimed.includes(t.id)).slice(0, 3);
  const primesPerHour = idle.primesPerDay / 24;

  const stageCards = stages.map(s => {
    const locked = !G.isStageUnlocked(s);
    const first = !state.stage.firstClear[s.id];
    const active = s.id === stage.id;
    const r = G.squadPower() / s.rec;
    const dot = r >= 1.05 ? '' : r >= 0.85 ? 'warn' : 'bad';
    return `<button class="stage-card ${active ? 'active' : ''} ${locked ? 'locked' : ''}" data-action="select-stage" data-id="${s.id}" ${locked ? 'disabled' : ''}>
      <span class="stage-code">${esc(s.code)}</span>
      <span class="stage-rec">PWR ${fmt(s.rec)}</span>
      <span class="stage-name">${esc(s.name)}</span>
      <span class="stage-power"><i class="power-dot ${dot}"></i>${first ? '首通 +' + s.firstClearPrime + ' ◆' : '已首通'} · 挂机 ${G.idleSummary(s).pullsPerHour.toFixed(1)} 抽/h</span>
    </button>`;
  }).join('');

  const squad = state.squad.map((id, i) => {
    if (!id) return `<button class="squad-slot empty" data-action="open-squad">+ 空位 ${i + 1}</button>`;
    const d = G.OP_BY_ID.get(id); const s = state.operators[id];
    return `<div class="squad-slot rarity-${d.rarity}" style="--rarity:${STAR_COLOR[d.rarity]}">
      <img class="sq-img" src="${G.portraitFor(id)}" alt="${esc(d.name)}" loading="lazy">
      <div class="sq-info"><div class="sq-name">${esc(d.name)}</div><div class="sq-sub">E${s.elite} L${s.level} · ${CLASS_GLYPH[d.cls]}</div></div>
      <button class="sq-remove" data-action="remove-squad" data-id="${id}" title="移出编队">×</button>
    </div>`;
  }).join('');

  return `<section class="page battle-page">
    ${pageHead('COMBAT TERMINAL // LIVE', '作战终端', `
      ${statHead('编队战力', fmt(power))}
      ${statHead('挂机寻访', idle.pullsPerHour.toFixed(1), ' 抽/时')}
      ${statHead('源石产出', (idle.shardsPerHour / PRIME_SHARD_COST * 24).toFixed(1), ' /天')}
    `)}
    <div class="battle-layout">
      <aside class="stage-panel">
        <div class="stage-tabs">${STAGE_GROUPS.map(g => `<button class="stage-tab ${g.id === ui.stageGroup ? 'active' : ''}" data-action="stage-group" data-group="${g.id}">${g.name}</button>`).join('')}</div>
        ${ui.stageGroup === 'main' ? `<div class="stage-chapter-row"><span class="filter-label">章节</span><select id="stageChapterSelect" class="stage-select" data-action="chapter-select">${chapters.map(s => `<option value="${s.chapterKey}" ${String(s.chapterKey) === String(ui.mainChapter) ? 'selected' : ''}>第${s.chapterKey === '0' ? '0' : s.chapterKey}章 · ${esc(s.chapter)}</option>`).join('')}</select><span class="mono">${stages.length} 关</span></div>` : ''}
        <div class="stage-list">${stageCards || '<div class="empty-state">暂无可用关卡</div>'}</div>
        <div class="stage-scroll-note">无理智限制 · 失败仍持续挂机 · 首通奖励源石</div>
      </aside>

      <div class="arena-column">
        <div class="arena-frame">
          <div class="arena-hud">
            <div class="arena-hud-left">
              <div class="hud-code">${esc(stage.code)}<small>${esc(stage.chapter)} / ${esc(stage.name)}</small></div>
              <div class="hud-stat"><b id="hudWave">WAVE 0/0</b><span>WAVE</span></div>
              <div class="hud-stat"><b id="hudTime">00:00</b><span>ELAPSED</span></div>
              <div class="hud-stat"><b id="hudPower">${fmt(power)}</b><span>POWER</span></div>
            </div>
            <div class="arena-controls">
              <button class="arena-ctl ${state.stage.speed === 1 ? 'active' : ''}" data-action="speed" data-speed="1">1×</button>
              <button class="arena-ctl ${state.stage.speed === 2 ? 'active' : ''}" data-action="speed" data-speed="2">2×</button>
              <button class="arena-ctl" data-action="pause" id="pauseBtn">${battle?.paused ? '▶' : '❚❚'}</button>
              <button class="arena-ctl ${state.stage.auto ? 'active' : ''}" data-action="toggle-auto" id="autoBtn">AUTO</button>
            </div>
          </div>
          <div class="arena march-stage" id="arena">
            <div class="march-sky"></div>
            <div class="march-sun"></div>
            <div class="march-far"></div>
            <div class="march-mid"></div>
            <div class="march-ground"></div>
            <div class="march-speed"></div>
            <div class="march-goal"></div>
            <div class="arena-layer enemies" id="layerEnemies"></div>
            <div class="arena-layer projectiles" id="layerProjectiles"></div>
            <div class="arena-layer fx" id="layerFx"></div>
            <div class="arena-layer allies" id="layerAllies"></div>
            <div class="arena-layer floats" id="layerFloats"></div>

            <div id="arenaOverlay"></div>
            <div id="arenaCast" class="cast-banner hidden"></div>
            <div id="skillCutin" class="skill-cutin hidden"></div>
            <div id="arenaWave" class="wave-flash hidden"></div>
            <div id="arenaPause" class="arena-paused hidden"><div class="pause-card"><span>PAUSED</span><b>自动作战已暂停</b><button class="btn btn-primary btn-small" data-action="pause">继续作战</button></div></div>
          </div>
          <div class="arena-bottom">
            <div class="arena-status"><i class="status-led ${damaged.length ? 'red' : ''}"></i><span id="arenaStatusText">${battle?.status === 'running' ? 'AUTO OPERATION' : 'STANDBY'} · 目标 ${esc(stage.name)}</span></div>
            <div class="inline" style="gap:8px">
              <span class="small mono" id="baseHpText">LEAK <b id="leakCount">0</b>/3 · DIST <b id="marchDistance">0</b>m</span>
              <button class="arena-ctl" data-action="restart" title="重新开始">↻</button>
            </div>
          </div>
        </div>

        <div class="stage-brief">
          <div class="brief-main">
            <div class="brief-title"><h3>${esc(stage.name)}</h3><span class="tag ${stage.group === 'annihilation' ? 'red' : 'orange'}">${esc(stage.code)}</span></div>
            <div class="brief-desc">${esc(stage.desc)}</div>
            <div class="brief-rewards">${rewardChips(stage)}</div>
          </div>
          <div class="brief-side">
            <div class="kv"><span>推荐战力</span><b>${fmt(stage.rec)}</b></div>
            <div class="kv"><span>当前编队</span><b>${fmt(power)}</b></div>
            <div class="kv"><span>预估胜率</span><b class="${estimate[1] === 'bad' ? 'red' : estimate[1] === 'warn' ? 'orange' : 'green'}">${estimate[0]}</b></div>
            <div class="progress mt-8"><i style="width:${Math.min(100, ratio * 100)}%;${ratio >= 1 ? '' : 'background:linear-gradient(90deg,#ff8a2a,#ff5d55)'}"></i></div>
            <div class="kv mt-8"><span>挂机合成玉</span><b class="orange">${idle.pullsPerHour.toFixed(1)} 抽/h</b></div>
            <div class="kv"><span>源石碎片</span><b>${idle.shardsPerHour.toFixed(1)}/h</b></div>
            <div class="kv"><span>基建材料块</span><b>${idle.blocksPerHour.toFixed(1)}/h</b></div>
            <div class="kv"><span>通用芯片</span><b class="orange">${idle.chipsPerHour.toFixed(0)}/h</b></div>
            <div class="kv"><span>通用芯片组</span><b class="orange">${idle.chipPacksPerHour.toFixed(0)}/h</b></div>
          </div>
        </div>
      </div>

      <aside class="squad-panel">
        <div class="squad-head"><div class="panel-title">编队</div><div class="squad-head"><b>${squadCount}<span class="dim" style="font-size:11px">/5</span></b></div></div>
        <div class="squad-power"><span>TOTAL POWER</span><b>${fmt(power)}</b></div>
        <div class="squad-list">${squad}</div>
        <div class="squad-actions">
          <button class="btn btn-small btn-primary" data-action="open-squad">编成</button>
          <button class="btn btn-small" data-action="auto-squad">自动编队</button>
          <button class="btn btn-small btn-ghost" data-action="refresh-battle">↻</button>
        </div>
        <div class="squad-synergy">${synergyText()}</div>
      </aside>
    </div>

    <div class="lower-grid">
      <div class="panel">
        <div class="panel-head"><div class="panel-title">挂机收益</div><span class="panel-meta">LIVE // ${esc(stage.code)}</span></div>
        <div class="panel-body">
          <div class="mini-stat-row">
            <div class="mini-stat"><span>合成玉 / 小时</span><b>${fmt(idle.orundumPerHour)}</b></div>
            <div class="mini-stat"><span>寻访 / 小时</span><b>${idle.pullsPerHour.toFixed(1)} 抽</b></div>
            <div class="mini-stat"><span>源石 / 天</span><b>${idle.primesPerDay.toFixed(1)}</b></div>
          </div>
          <div class="kv mt-12"><span>源石碎片进度</span><b>${Math.floor(state.primeShards)} / ${PRIME_SHARD_COST}</b></div>
          <div class="progress mt-8"><i class="cyan" style="width:${(state.primeShards / PRIME_SHARD_COST) * 100}%"></i></div>
          <div class="small mt-8">挂机收益与胜负无关；即使无法通关，也会按所选关卡持续积累。基建材料块 ${idle.blocksPerHour.toFixed(1)}/h。</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title">日常任务</div><span class="panel-meta">${state.daily.claimed.length}/${DAILY_TASKS.length}</span></div>
        <div class="panel-body">
          <div class="task-mini">
            ${taskList.length ? taskList.map(t => {
              const p = G.taskProgress(t);
              return `<div class="task-line"><span>${t.name}</span><b class="mono ${p >= t.target ? 'green' : 'dim'}">${p}/${t.target}</b><div class="tp"><i style="width:${Math.min(100, p / t.target * 100)}%"></i></div></div>`;
            }).join('') : '<div class="small">今日任务已完成。罗德岛感谢你的值守。</div>'}
          </div>
          <button class="btn btn-small mt-12" data-action="tasks">打开任务面板</button>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title">罗德岛状态</div><span class="panel-meta">${damaged.length ? 'ALERT' : 'NOMINAL'}</span></div>
        <div class="panel-body">
          ${damaged.length ? `<div class="base-alert"><b>${damaged.map(r => r.name).join('、')}</b> 受损，产出与加成暂停。<br><button class="btn btn-small btn-danger mt-8" data-action="repair-all">全部维修 · ${fmt(damaged.reduce((s, r) => s + G.repairCost(r.id), 0))} LMD</button></div>` : `<div class="small">所有设施运转正常。维什戴尔正在远处观察承重墙。</div>`}
          <div class="divider"></div>
          <div class="kv"><span>结构监测</span><b>${(state.base.sabotageTimer / 120 * 100).toFixed(0)}%</b></div>
          <div class="progress red mt-8"><i style="width:${state.base.sabotageTimer / 120 * 100}%"></i></div>
          <div class="small mt-8">每 2 分钟进行一次结构判定。爆炸概率低，但并非为零。</div>
          ${state.base.sabotageLog[0] ? `<div class="small mt-8">最近：${esc(state.base.sabotageLog[0].name)} · ${timeAgo(state.base.sabotageLog[0].at)}</div>` : ''}
        </div>
      </div>
    </div>
  </section>`;
}

function arenaGhosts() {
  const slots = [[40, 21], [40, 50], [40, 79], [31, 21], [31, 50], [31, 79], [23, 21], [23, 50], [23, 79], [14, 21], [14, 50], [14, 79]];
  return slots.map(([x, y]) => `<div class="slot-ghost" style="left:${x}%;top:${y}%"></div>`).join('');
}

function synergyText() {
  const ids = state.squad.filter(Boolean);
  const b = G.getSquadBuffs(ids);
  const parts = [];
  if (b.atk) parts.push(`攻击 +${pct(b.atk, 0)}`);
  if (b.hp) parts.push(`生命 +${pct(b.hp, 0)}`);
  if (b.def) parts.push(`防御 +${pct(b.def, 0)}`);
  if (b.heal) parts.push(`治疗 +${pct(b.heal, 0)}`);
  return `职业协同：${parts.length ? parts.join(' · ') : '上阵 2 名同职业干员可激活加成'}。`;
}

function rewardChips(stage) {
  const r = stage.rewards;
  const chips = [];
  chips.push(`<span class="reward-chip">龙门币 <b>${fmt(r.lmd)}</b></span>`);
  if (r.orundum) chips.push(`<span class="reward-chip">合成玉 <b>${r.orundum}</b></span>`);
  if (!state.stage.firstClear[stage.id]) chips.push(`<span class="reward-chip">首通 <b>◆ ${stage.firstClearPrime}</b></span>`);
  if (stage.group === 'resource') {
    for (const [id, n] of Object.entries(r.items || {})) chips.push(`<span class="reward-chip">${MATERIALS[id]?.name || id} <b>×${n}</b></span>`);
    if (stage.drops?.length) chips.push(`<span class="reward-chip">随机素材 <b>×1-3</b></span>`);
  }
  return chips.join('');
}

function setupArena() {
  const arena = $('#arena');
  if (!arena || !battle) return;
  ui.arena = {
    allies: new Map(), enemies: new Map(), projectiles: new Map(), floats: new Map(), effects: new Map(),
    layerAllies: $('#layerAllies'), layerEnemies: $('#layerEnemies'), layerProjectiles: $('#layerProjectiles'),
    layerFloats: $('#layerFloats'), layerFx: $('#layerFx'), overlay: $('#arenaOverlay'),
    cast: $('#arenaCast'), wave: $('#arenaWave'), pause: $('#arenaPause'),
  };
  ui.renderedRun = -1;
  ui.resultKey = '';
  initSpineArena(arena);
  syncArena(true);
}

function renderRangeOverlay() {
  const overlay = $('#rangeOverlay');
  if (!overlay) return;
  if (!battle || (!ui.showRanges && !ui.deploying)) {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    return;
  }
  let units = battle.allies.filter(a => !a.dead);
  if (ui.deploying) units = units.filter(a => a.id === ui.deploying);
  if (!units.length) { overlay.classList.add('hidden'); return; }
  overlay.classList.remove('hidden');
  overlay.innerHTML = units.map(a => {
    const st = G.getOpStats(a.id);
    const d = G.OP_BY_ID.get(a.id);
    if (!st || !d) return '';
    const r = Math.max(7, Math.min(74, Number(st.range) || 12));
    const w = r * 1.45, h = r * 0.86;
    const selected = ui.deploying === a.id;
    return `<div class="range-ring ${selected ? 'selected' : ''} ${r > 40 ? 'ranged' : 'melee'}" style="left:${a.x - w / 2}%;top:${a.y - h / 2}%;width:${w}%;height:${h}%">
      <span>${esc(CLASS_GLYPH[d.cls] || '')}${selected ? ' · 点击战场放置' : ''}</span>
    </div>`;
  }).join('');
}

function renderGridRange() {
  const grid = $('#deployGrid');
  if (!grid) return;
  const cells = [...grid.querySelectorAll('.deploy-cell')];
  cells.forEach(c => c.classList.remove('in-range', 'self-range'));
  if (!ui.deploying || !battle) return;
  const unit = battle.allies.find(a => a.id === ui.deploying && !a.dead);
  if (!unit) return;
  const st = G.getOpStats(unit.id);
  const cols = [15, 29, 43, 57, 71, 85];
  const rows = [21, 50, 79];
  const ux = cols.reduce((best, x, i) => Math.abs(x - unit.x) < Math.abs(cols[best] - unit.x) ? i : best, 0);
  const uy = rows.reduce((best, y, i) => Math.abs(y - unit.y) < Math.abs(rows[best] - unit.y) ? i : best, 0);
  const ranged = (st?.range || 0) > 40;
  for (const cell of cells) {
    const col = Number(cell.dataset.col), row = Number(cell.dataset.row);
    const dx = col - ux, dy = Math.abs(row - uy);
    const inRange = ranged
      ? (dx >= 1 && dx <= 3 && dy <= 1)
      : (dx === 1 && dy === 0);
    cell.classList.toggle('in-range', inRange);
    cell.classList.toggle('self-range', col === ux && row === uy);
  }
}

function startDeploy(id) {
  if (!battle?.allies.some(a => a.id === id)) {
    toast('该干员不在当前编队。先编入队伍，再调整站位。', 'warn');
    return;
  }
  ui.deploying = id;
  ui.gridVisible = true;
  ui.showRanges = true;
  if (ui.view !== 'battle') setView('battle');
  requestAnimationFrame(() => { renderRangeOverlay(); renderGridRange(); });
  const d = G.OP_BY_ID.get(id);
  toast(`调整 ${d?.name || id} 的部署位置：点击战场空地。`, 'success');
}

function placeDeployment(clientX, clientY) {
  const arena = $('#arena');
  if (!arena || !ui.deploying) return;
  const r = arena.getBoundingClientRect();
  const x = (clientX - r.left) / r.width * 100;
  const y = (clientY - r.top) / r.height * 100;
  const d = G.OP_BY_ID.get(ui.deploying);
  if (battle?.setDeployment(ui.deploying, x, y)) {
    toast(`${d?.name || ui.deploying} 已移动到新位置。`, 'success');
    ui.deploying = null;
    ui.showRanges = false;
    ui.gridVisible = false;
    renderRangeOverlay();
    syncArena();
  }
}

function rangePreview(d) {
  const st = G.getOpStats(d.id);
  const reach = (st?.range || 12) > 40 ? 2 : 1;
  const cells = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 5; x++) {
      const center = y === 1 && x === 2;
      const inRange = y === 1 ? (x > 2 && x <= 2 + reach) || x === 2 : Math.abs(y - 1) === 1 && x > 2 && reach > 1;
      cells.push(`<i class="${center ? 'self' : inRange ? 'inrange' : ''}"></i>`);
    }
  }
  return `<div class="range-preview"><div class="range-grid">${cells.join('')}</div><span>${esc(d.cls)} · 射程 ${st?.range ? Math.round(st.range) : 12}</span></div>`;
}

function makeAllyEl(a) {
  const d = G.OP_BY_ID.get(a.id);
  const node = el('div', `ally-token rarity-${d?.rarity || 3} ${a.phantom ? 'phantom' : ''}`);
  node.dataset.uid = a.uid;
  node.style.setProperty('--rarity', STAR_COLOR[d?.rarity || 3]);
  if (a.phantom) {
    node.innerHTML = `<div class="portrait"><span class="phantom-mark">影</span></div><div class="hpbar"><i></i></div><div class="spbar"><i></i></div><div class="unit-name">逍遥影卫</div>`;
  } else {
    node.innerHTML = `<div class="portrait"><img src="${G.portraitFor(a.id)}" alt="${esc(d.name)}" loading="lazy"><span class="block-badge"></span></div><div class="hpbar"><i></i></div><div class="spbar"><i></i></div><div class="unit-name">${esc(d.name)}</div>`;
  }
  node._refs = { hp: node.querySelector('.hpbar i'), sp: node.querySelector('.spbar i'), badge: node.querySelector('.block-badge') };
  return node;
}

function makeEnemyEl(e) {
  const node = el('div', `enemy-token ${e.type} ${e.boss ? 'boss' : ''}`);
  node.dataset.uid = e.uid;
  node.style.setProperty('--size', e.size || 1);
  node.innerHTML = `<div class="enemy-body"><span>${esc(e.glyph)}</span></div><div class="ehp"><i></i></div>`;
  node._refs = { hp: node.querySelector('.ehp i') };
  return node;
}

function syncArena(rebuild = false) {
  if (!ui.arena || ui.view !== 'battle') return;
  if (!battle) return;
  if (rebuild || battle.runId !== ui.renderedRun) {
    ui.renderedRun = battle.runId;
    ui.resultKey = '';
    for (const k of ['layerAllies', 'layerEnemies', 'layerProjectiles', 'layerFloats', 'layerFx']) {
      if (ui.arena[k]) ui.arena[k].innerHTML = '';
    }
    ui.arena.allies.clear(); ui.arena.enemies.clear(); ui.arena.projectiles.clear(); ui.arena.floats.clear(); ui.arena.effects.clear();
    if (ui.arena.overlay) ui.arena.overlay.innerHTML = '';
    if (ui.arena.pause) ui.arena.pause.classList.add('hidden');
    ui.resultKey = '';
  }
  const a = ui.arena;
  // allies
  const alive = new Set();
  for (const unit of battle.allies) {
    alive.add(unit.uid);
    let node = a.allies.get(unit.uid);
    if (!node) { node = makeAllyEl(unit); a.layerAllies.appendChild(node); a.allies.set(unit.uid, node); }
    const bob = Math.sin(performance.now() / 170 + (unit.bobPhase || 0)) * 1.6;
    const bobX = Math.sin(performance.now() / 220 + (unit.bobPhase || 0)) * 0.7;
    node.style.left = `calc(${unit.x}% + ${bobX.toFixed(1)}px)`;
    node.style.top = `calc(${unit.y}% + ${bob.toFixed(1)}px)`;
    node._refs.hp.style.width = Math.max(0, unit.hp / unit.maxHp * 100) + '%';
    node._refs.sp.style.width = Math.min(100, unit.sp / unit.maxSp * 100) + '%';
    node.classList.toggle('dead', unit.dead);
    node.classList.toggle('spine-unit', isOperatorSpineReady(unit.id));
    node.classList.toggle('hit', unit.hitFlash > 0.04);
    node.classList.toggle('casting', unit.castUntil > 0);
    node.classList.toggle('attacking', (unit.attackLock || 0) > 0.01 || (unit.attackFlash || 0) > 0.04);
    node.classList.toggle('healed', unit.healFlash > 0.05);
    delete node.dataset.action;
    delete node.dataset.id;
    node.title = `${G.OP_BY_ID.get(unit.id)?.name || unit.id} · 编队成员`;
    if (node._refs.badge) {
      node._refs.badge.textContent = unit.blockCount > 0 ? unit.blockCount : '';
      node._refs.badge.style.display = unit.blockCount > 0 ? 'grid' : 'none';
    }
  }
  for (const [uid, node] of a.allies) if (!alive.has(uid)) { node.remove(); a.allies.delete(uid); }

  // enemies
  const eAlive = new Set();
  for (const e of battle.enemies) {
    if (e.dead) continue;
    eAlive.add(e.uid);
    let node = a.enemies.get(e.uid);
    if (!node) { node = makeEnemyEl(e); a.layerEnemies.appendChild(node); a.enemies.set(e.uid, node); }
    node.style.left = e.x + '%';
    node.style.top = e.y + '%';
    node._refs.hp.style.width = Math.max(0, e.hp / e.maxHp * 100) + '%';
    node.classList.toggle('hit', e.hitFlash > 0.04);
    node.classList.toggle('spine-unit', isEnemySpineReady(e.type, e.bossKey));
    node.classList.toggle('attacking', (e.attackFlash || 0) > 0.04);
    node.classList.toggle('stunned', e.stun > 0);
  }
  for (const [uid, node] of a.enemies) if (!eAlive.has(uid)) { node.remove(); a.enemies.delete(uid); }
  const deployGrid = $('#deployGrid');
  if (deployGrid) deployGrid.classList.toggle('hidden', !(ui.gridVisible || !!ui.deploying));
  renderRangeOverlay();
  renderGridRange();

  // projectiles
  const pAlive = new Set();
  for (const p of battle.projectiles) {
    pAlive.add(p.id);
    let node = a.projectiles.get(p.id);
    if (!node) { node = el('div', 'projectile ' + p.type); a.layerProjectiles.appendChild(node); a.projectiles.set(p.id, node); }
    node.style.left = (p.cx ?? p.x) + '%';
    node.style.top = (p.cy ?? p.y) + '%';
  }
  for (const [id, node] of a.projectiles) if (!pAlive.has(id)) { node.remove(); a.projectiles.delete(id); }

  // floats
  const fAlive = new Set();
  for (const f of battle.floats) {
    fAlive.add(f.id);
    let node = a.floats.get(f.id);
    if (!node) { node = el('div', 'float-text ' + f.tone, esc(f.text)); a.layerFloats.appendChild(node); a.floats.set(f.id, node); }
    node.style.left = f.x + '%';
    node.style.top = f.y + '%';
    node.style.opacity = Math.max(0, f.life / f.maxLife);
  }
  for (const [id, node] of a.floats) if (!fAlive.has(id)) { node.remove(); a.floats.delete(id); }

  // effects
  const xAlive = new Set();
  for (const x of battle.effects) {
    xAlive.add(x.id);
    let node = a.effects.get(x.id);
    if (!node) { node = el('div', 'fx ' + x.kind); a.layerFx.appendChild(node); a.effects.set(x.id, node); }
    node.style.left = x.x + '%';
    node.style.top = x.y + '%';
  }
  for (const [id, node] of a.effects) if (!xAlive.has(id)) { node.remove(); a.effects.delete(id); }

  syncSpine(battle);

  // HUD
  const hudWave = $('#hudWave'); if (hudWave) hudWave.textContent = `WAVE ${battle.wave}/${battle.totalWaves}`;
  const hudTime = $('#hudTime'); if (hudTime) hudTime.textContent = clock(battle.time);
  const hudPower = $('#hudPower'); if (hudPower) hudPower.textContent = fmt(G.squadPower());
  const basePips = $('#basePips');
  if (basePips) [...basePips.children].forEach((n, i) => n.classList.toggle('lost', i >= battle.baseHp));
  const marchDistance = $('#marchDistance');
  if (marchDistance) marchDistance.textContent = String(Math.floor(battle.time * 14 + battle.kills * 9));
  const leakCount = $('#leakCount');
  if (leakCount) { leakCount.textContent = String(battle.leaks || 0); leakCount.classList.toggle('red', (battle.leaks || 0) >= 2); }
  const statusText = $('#arenaStatusText');
  if (statusText) statusText.textContent = battle.status === 'running' ? `AUTO OPERATION · ${state.stage.auto ? '循环中' : '单次'}` : battle.status === 'victory' ? 'OPERATION COMPLETE' : battle.status === 'defeat' ? 'OPERATION FAILED' : 'STANDBY';
  if (a.pause) a.pause.classList.toggle('hidden', !(battle.paused && battle.status === 'running'));
  const pauseBtn = $('#pauseBtn'); if (pauseBtn) pauseBtn.textContent = battle.paused ? '▶' : '❚❚';
  const autoBtn = $('#autoBtn'); if (autoBtn) autoBtn.classList.toggle('active', state.stage.auto);

  if (a.cast) {
    if (battle.cast) { a.cast.textContent = battle.cast.name; a.cast.classList.remove('hidden'); a.cast.style.borderLeftColor = battle.cast.color; }
    else a.cast.classList.add('hidden');
  }
  if (a.wave) {
    if (battle.waveFlash > 0 && battle.status === 'running') { a.wave.textContent = 'WAVE ' + String(battle.wave).padStart(2, '0'); a.wave.classList.remove('hidden'); }
    else a.wave.classList.add('hidden');
  }
  const cut = $('#skillCutin');
  if (cut) {
    if (battle.cutIn && battle.cutIn.life > 0) {
      if (cut.dataset.key !== battle.cutIn.key) {
        cut.dataset.key = battle.cutIn.key;
        cut.innerHTML = `<img src="${G.portraitFor(battle.cutIn.id)}" alt=""><div><span>SKILL ACTIVATED</span><b>${esc(battle.cutIn.skill)}</b><small>${esc(battle.cutIn.name)}</small></div>`;
      }
      cut.classList.remove('hidden');
      cut.style.opacity = Math.min(1, battle.cutIn.life * 4);
    } else {
      cut.classList.add('hidden');
      cut.dataset.key = '';
    }
  }

  // result
  const key = battle.runId + ':' + battle.status;
  if ((battle.status === 'victory' || battle.status === 'defeat') && ui.resultKey !== key) {
    ui.resultKey = key;
    const win = battle.status === 'victory';
    const r = battle.lastReward;
    const first = r?.first;
    a.overlay.innerHTML = `<div class="arena-result">
      <div class="result-card ${win ? '' : 'defeat'}">
        <div class="result-kicker">${win ? 'OPERATION COMPLETE' : 'OPERATION FAILED'} // ${esc(battle.stage.code)}</div>
        <div class="result-title">${win ? '作战成功' : '作战失败'}</div>
        <div class="result-reason">${win ? esc(battle.stage.name) + ' · 防线稳定' : esc(battle.reason || '防线崩溃') + ' · 挂机收益仍在继续'}</div>
        ${win ? `<div class="result-rewards">
          <div class="result-reward"><small>龙门币</small>+${fmt((r?.lmd || 0) + (r?.killLmd || 0))}</div>
          ${r?.killLmd ? `<div class="result-reward"><small>其中击杀已入账</small>+${fmt(r.killLmd)}</div>` : ''}
          <div class="result-reward"><small>合成玉</small>+${fmt(r?.orundum || 0)}</div>
          ${first ? `<div class="result-reward" style="color:#ff8b84"><small>首通源石</small>+${first.primes} ◆</div>` : ''}
        </div>` : `<div class="result-rewards"><div class="result-reward"><small>挂机</small>继续积累中</div></div>`}
        ${state.stage.auto ? `<div class="result-countdown" id="resultCountdown">自动继续 ${Math.max(0, battle.endTimer).toFixed(1)}s</div>` : ''}
        <div class="result-actions">
          ${win && battle.nextStageId && battle.nextStageId !== battle.stage.id
            ? `<button class="btn btn-primary btn-small" data-action="next-stage">下一关</button>`
            : `<button class="btn btn-primary btn-small" data-action="restart">再次作战</button>`}
          <button class="btn btn-small" data-action="exit-battle">退出作战</button>
        </div>
      </div>
    </div>`;
  } else if (battle.status === 'running' && a.overlay.innerHTML) {
    a.overlay.innerHTML = '';
  }
  const countdown = a.overlay.querySelector?.('#resultCountdown');
  if (countdown) countdown.textContent = `自动继续 ${Math.max(0, battle.endTimer).toFixed(1)}s`;
}

function updateBaseDynamic() {
  const b = $('#baseSabotagePct');
  if (b) b.textContent = Math.min(100, state.base.sabotageTimer / 120 * 100).toFixed(0) + '%';
  const bar = $('#baseSabotageBar');
  if (bar) bar.style.width = Math.min(100, state.base.sabotageTimer / 120 * 100) + '%';
}

// ── operators ─────────────────────────────────────────────────────
function ownedCount() { return Object.keys(state.operators).length; }

function filteredOperators() {
  const { rarity, cls, owned, sort } = ui.filter;
  let list = OPERATORS.filter(o => (!rarity || o.rarity === rarity) && (cls === 'all' || o.cls === cls) && (!owned || G.owned(o.id)));
  if (sort === 'power') list.sort((a, b) => G.opPower(b.id) - G.opPower(a.id));
  else if (sort === 'level') list.sort((a, b) => (state.operators[b.id]?.level || 0) - (state.operators[a.id]?.level || 0));
  else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  else list.sort((a, b) => Number(G.owned(b.id)) - Number(G.owned(a.id)) || b.rarity - a.rarity || G.opPower(b.id) - G.opPower(a.id));
  return list;
}

function renderOperators() {
  const list = filteredOperators();
  const sortName = { rarity: '稀有度', power: '战力', level: '等级', name: '名称' }[ui.filter.sort];
  const cards = list.map(d => {
    const o = state.operators[d.id];
    const isOwned = !!o;
    const pot = o?.potential || 0;
    const levelText = isOwned ? `E${o.elite} L${o.level}` : '未获得';
    return `<button class="op-card rarity-${d.rarity} ${isOwned ? '' : 'unowned'}" style="--rarity:${STAR_COLOR[d.rarity]};--class-color:${classOf(d)}" data-action="operator" data-id="${d.id}">
      <span class="rarity-strip"></span>
      <img src="${G.portraitFor(d.id)}" alt="${esc(d.name)}" loading="lazy">
      <span class="class-badge">${CLASS_GLYPH[d.cls]}</span>
      <span class="op-id">NO.${String(OPERATORS.indexOf(d) + 1).padStart(3, '0')}</span>
      <div class="op-info">
        <div class="op-name">${esc(d.name)} ${stars(d.rarity)}</div>
        <div class="op-sub"><span>${d.cls} / ${d.sub}</span><span class="op-level">${levelText}</span></div>
        <div class="op-bottom">
          <span class="op-pot">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= pot ? 'on' : ''}"></i>`).join('')}</span>
          <span class="op-power">${isOwned ? 'PWR ' + fmt(G.opPower(d.id)) : '—'}</span>
        </div>
      </div>
    </button>`;
  }).join('');

  return `<section class="page">
    ${pageHead('OPERATOR ARCHIVE // ' + ownedCount() + '/' + OPERATORS.length, '干员档案', `
      ${statHead('已拥有', ownedCount(), ' / ' + OPERATORS.length)}
      ${statHead('六星干员', Object.keys(state.operators).filter(id => G.OP_BY_ID.get(id)?.rarity === 6).length)}
      ${statHead('最高战力', fmt(Math.max(...Object.keys(state.operators).map(id => G.opPower(id)), 0)))}
    `)}
    <div class="operators-toolbar">
      <div class="filter-group"><span class="filter-label">稀有度</span>
        ${[0, 6, 5, 4, 3, 2].map(r => `<button class="filter-btn ${ui.filter.rarity === r ? 'active' : ''}" data-action="op-filter" data-kind="rarity" data-value="${r}">${r || 'ALL'}</button>`).join('')}
      </div>
      <div class="filter-group"><span class="filter-label">职业</span>
        <button class="filter-btn ${ui.filter.cls === 'all' ? 'active' : ''}" data-action="op-filter" data-kind="cls" data-value="all">全</button>
        ${CLASSES.map(c => `<button class="filter-btn ${ui.filter.cls === c ? 'active' : ''}" data-action="op-filter" data-kind="cls" data-value="${c}" style="color:${CLASS_COLOR[c]}">${CLASS_GLYPH[c]}</button>`).join('')}
      </div>
      <button class="filter-btn ${ui.filter.owned ? 'active' : ''}" data-action="op-filter" data-kind="owned" data-value="1">仅已拥有</button>
      <button class="filter-btn" data-action="op-sort">排序：${sortName}</button>
      <span class="small" style="margin-left:auto">${list.length} 名干员</span>
    </div>
    <div class="op-grid">${cards || '<div class="empty-state"><b>没有匹配的干员</b>调整筛选条件试试。</div>'}</div>
  </section>`;
}

function bagExp() {
  return ['record1', 'record2', 'record3', 'record4'].reduce((s, id) => s + G.itemCount(id) * (MATERIALS[id]?.exp || 0), 0);
}

function costLine(cost) {
  if (!cost) return '';
  const parts = [];
  if (cost.lmd) parts.push(`<span class="cost-item ${state.lmd < cost.lmd ? 'missing' : ''}"><span class="ci">L</span> ${fmt(cost.lmd)}</span>`);
  if (cost.orundum) parts.push(`<span class="cost-item ${state.orundum < cost.orundum ? 'missing' : ''}"><span class="ci">◇</span> ${fmt(cost.orundum)}</span>`);
  if (cost.distinction) parts.push(`<span class="cost-item ${state.distinction < cost.distinction ? 'missing' : ''}"><span class="ci">▤</span> ${fmt(cost.distinction)}</span>`);
  for (const [id, n] of Object.entries(cost.items || {})) {
    parts.push(`<span class="cost-item ${G.itemCount(id) < n ? 'missing' : ''}"><span class="ci">${MATERIALS[id]?.glyph || '·'}</span> ${MATERIALS[id]?.name || id} ${n}</span>`);
  }
  return parts.join('');
}

function skillLabel(s) {
  if (s.skill < 7) return 'LV ' + s.skill;
  return s.mastery ? 'M' + s.mastery : 'LV 7';
}

export function openOperator(id, opts = {}) {
  const d = G.OP_BY_ID.get(id);
  if (!d) return;
  if (!G.owned(id)) { toast('尚未获得该干员。前往寻访，或使用 300 抽自选兑换。', 'warn'); return; }
  const s = state.operators[id];
  const st = G.getOpStats(id);
  const next = G.nextLevelInfo(id);
  const promo = G.promotionInfo(id);
  const skill = G.skillReqInfo(id);
  const mod = G.moduleReqInfo(id);
  const allSkins = G.skinsFor(id);
  const equipped = state.skins.equipped[id];
  const baseExp = bagExp();
  const canLevel = !next?.capped && (s.exp || 0) + baseExp >= next.needExp && state.lmd >= next.lmd;
  const defaultPct = Math.round(G.skinScale(`${id}-default`) * 100);
  const defaultCard = `<button class="skin-card ${!equipped ? 'equipped' : ''}" data-action="op-skin-default" data-op="${id}" title="默认皮肤">
    <img src="${d.img}" alt="默认皮肤" loading="lazy">
    <div class="skin-meta"><b>默认皮肤</b><span>${!equipped ? '已装备' : '点击装备'}</span></div>
  </button>`;
  const skinCards = [defaultCard, ...allSkins.map(sk => {
    const owned = G.skinOwned(id, sk.id);
    const isEq = equipped === sk.key;
    return `<button class="skin-card ${owned ? 'owned' : ''} ${isEq ? 'equipped' : ''}" data-action="${owned ? 'op-skin' : 'op-buy-skin'}" data-id="${sk.id}" data-op="${id}" style="--skin-color:${sk.color}" title="${esc(sk.series)}">
      <img src="${sk.img}" alt="${esc(sk.name)}" loading="lazy">
      <div class="skin-meta"><b>${esc(sk.name)}</b><span>${owned ? (isEq ? '已装备' : '点击装备') : '◆ ' + SKIN_PRICE}</span></div>
    </button>`;
  })].join('');
  const defaultScaleBlock = !equipped ? `<div class="skin-scale-row default-skin-scale">
    <div class="skin-scale-head"><label><span>战斗小人大小</span><b data-skin-scale-value="${id}-default">${defaultPct}%</b></label><button class="skin-scale-reset" data-action="reset-skin-scale" data-id="${id}-default" title="重置为 100%">↺</button></div>
    <input type="range" min="50" max="200" step="1" value="${defaultPct}" data-skin-scale="${id}-default" aria-label="默认皮肤 战斗小人大小">
  </div>` : `<div class="detail-note">当前使用购买皮肤，战斗小人大小在「时装」页面调整。</div>`;

  const body = `<div class="op-detail">
    <div class="op-detail-hero rarity-${d.rarity}" style="--rarity:${STAR_COLOR[d.rarity]};--rarity-soft:${STAR_COLOR[d.rarity]}22">
      <img src="${G.portraitFor(id)}" alt="${esc(d.name)}">
      <div class="odh-info">
        <div class="odh-name">${esc(d.name)}</div>
        <div class="odh-sub">${d.cls} / ${d.sub} · 精英 ${s.elite} · 潜能 ${s.potential}</div>
        <div class="odh-quote">“${esc(d.quote || '博士，请下达指令。')}”</div>
        <div class="odh-trust"><div class="tl"><span>TRUST</span><span>${Math.floor(s.trust)} / 100</span></div><div class="progress"><i style="width:${s.trust}%"></i></div></div>
      </div>
    </div>
    <div class="op-detail-main">
      <div class="detail-top">
        <div><h3>${esc(d.name)}</h3><div class="detail-stars">${stars(d.rarity)} <span class="tag" style="margin-left:6px;color:${classOf(d)};border-color:${classOf(d)}55">${d.cls}</span></div></div>
        <div class="detail-lv"><b>E${s.elite} · ${s.level}</b><span>LEVEL / ${G.levelCap(d.rarity, s.elite)}</span><div class="power-badge">PWR <b>${fmt(G.opPower(id))}</b></div></div>
      </div>
      <div class="stat-grid">
        <div class="stat-box"><span>HP</span><b>${fmt(st.hp)}</b></div>
        <div class="stat-box"><span>ATK</span><b>${fmt(st.atk)}</b></div>
        <div class="stat-box"><span>DEF</span><b>${fmt(st.def)}</b></div>
        <div class="stat-box"><span>RES</span><b>${st.res.toFixed(0)}</b></div>
        <div class="stat-box"><span>攻击间隔</span><b>${st.interval.toFixed(2)}s</b></div>
        <div class="stat-box"><span>阻挡</span><b>${st.block}</b></div>
        <div class="stat-box"><span>攻击范围</span><b>${st.range > 40 ? '远程' : '近战'}</b></div>
        <div class="stat-box"><span>信赖加成</span><b>+${(s.trust / 100 * 8).toFixed(1)}%</b></div>
      </div>

      ${id === 'amiya' || id === 'char_1001_amiya2' || id === 'char_1037_amiya3' ? `<div class="detail-section amiya-form-section">
        <div class="detail-section-head"><b>升变</b><span>剧情形态切换</span></div>
        <div class="detail-section-body">
          <div class="amiya-forms">
            ${[
              ['amiya', '阿米娅 · 术师', '主线初始'],
              ['char_1001_amiya2', '阿米娅 · 近卫', '通关 R8-11'],
              ['char_1037_amiya3', '阿米娅 · 医疗', '通关 14-23'],
            ].map(([fid, name, req]) => {
              const isCurrent = fid === id;
              const unlocked = fid === 'amiya' || G.amiyaFormUnlocked(fid);
              return `<button class="amiya-form ${isCurrent ? 'active' : ''}" data-action="amiya-form" data-id="${fid}" ${isCurrent || !unlocked ? 'disabled' : ''}>
                <b>${esc(name)}</b><span>${isCurrent ? '当前形态' : unlocked ? '点击切换' : req}</span>
              </button>`;
            }).join('')}
          </div>
        </div>
      </div>` : ''}

      <div class="detail-section">
        <div class="detail-section-head"><b>横版编队</b><span>5 人队伍 · 前后排自动站位</span></div>
        <div class="detail-section-body">
          <div class="deploy-row">
            ${rangePreview(d)}
            <div class="deploy-copy">
              <b>${st.range > 40 ? '后排' : '前排'} · 阻挡 ${st.block}</b>
              <span>战斗改为横版推进：近战在前排阻挡，远程与医疗在后排输出。</span>
              <span class="small">队伍会在战场中向前奔跑，遇敌停战、清波继续；不再使用格子部署。</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-head"><b>等级提升</b><span>${next?.capped ? '已达当前上限' : 'EXP ' + fmt(next.needExp)}</span></div>
        <div class="detail-section-body">
          ${next?.capped ? `<div class="detail-note">已达到 E${s.elite} 的等级上限，请完成精英化。</div>` : `
            <div class="lvl-bar"><span>LV ${s.level} / ${next.cap}</span><b>${fmt(s.exp || 0)} / ${fmt(next.needExp)}</b></div>
            <div class="progress"><i style="width:${Math.min(100, (s.exp || 0) / next.needExp * 100)}%"></i></div>
            <div class="cost-line"><span class="cost-item ${state.lmd < next.lmd ? 'missing' : ''}"><span class="ci">L</span> ${fmt(next.lmd)}</span><span class="small">升级消耗作战记录，库存经验 ${fmt(baseExp)}</span></div>
            <div class="action-row">
              <button class="btn btn-small btn-primary" data-action="op-level" data-id="${id}" data-times="1" ${canLevel ? '' : 'disabled'}>升级 +1</button>
              <button class="btn btn-small" data-action="op-level" data-id="${id}" data-times="10" ${canLevel ? '' : 'disabled'}>+10</button>
              <button class="btn btn-small" data-action="op-level" data-id="${id}" data-times="999" ${canLevel ? '' : 'disabled'}>升到上限</button>
            </div>`}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-head"><b>精英化</b><span>${promo?.maxed ? '已完成全部精英化' : promo?.locked ? '需 LV ' + promo.needLevel : 'E' + s.elite + ' → E' + promo.next}</span></div>
        <div class="detail-section-body">
          ${promo?.maxed ? `<div class="detail-note">该干员已抵达最高精英阶段。可继续升级技能与模组。</div>` : promo?.locked ? `<div class="detail-note">达到等级上限 LV ${promo.needLevel} 后开放精英化。</div>` : `
            <div class="cost-line">${costLine(promo.cost)}</div>
            <div class="action-row"><button class="btn btn-small btn-primary" data-action="op-promote" data-id="${id}" ${G.canPay(promo.cost) ? '' : 'disabled'}>执行精英化</button><span class="small">精英化不重置等级，解锁更高等级上限。</span></div>`}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-head"><b>技能 · ${esc(d.skill.name)}</b><span>${skillLabel(s)} · 倍率 ×${st.skillPower.toFixed(2)}</span></div>
        <div class="detail-section-body">
          <div class="skill-name">${esc(d.skill.name)} <span class="tag cyan">${skill?.kind === 'mastery' ? '专精' : '技能'}</span></div>
          <div class="skill-desc">${esc(G.skillDescription(id))}</div>
          <div class="skill-meta"><span>自动回复</span><span>自动触发</span><span>SP 30</span></div>
          ${skill?.maxed ? `<div class="detail-note">技能已专精三。战斗中的技能倍率已计入属性。</div>` : skill?.locked ? `<div class="detail-note">精英二后开放技能专精。</div>` : `
            <div class="cost-line">${costLine(skill.cost)}</div>
            <div class="action-row"><button class="btn btn-small btn-primary" data-action="op-skill" data-id="${id}" ${G.canPay(skill.cost) ? '' : 'disabled'}>${skill.kind === 'mastery' ? '训练专精 ' + skill.next : '提升至 LV ' + skill.next}</button></div>`}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-head"><b>天赋</b><span>${d.rarity === 6 ? '精英天赋' : '基础天赋'}</span></div>
        <div class="detail-section-body"><div class="skill-desc">${esc(G.talentText(id))}</div></div>
      </div>

      <div class="detail-section">
        <div class="detail-section-head"><b>模组</b><span>${mod?.maxed ? 'MODULE MAX' : mod?.locked ? '需精英二' : 'MODULE ' + (mod?.next || 0)}</span></div>
        <div class="detail-section-body">
          <div class="mastery-pips">${[1, 2, 3].map(i => `<i class="${(s.module || 0) >= i ? 'on' : ''}"></i>`).join('')}</div>
          <div class="detail-note">每级模组提供 4% 基础属性与少量技能倍率。</div>
          ${mod?.maxed || mod?.locked ? '' : `<div class="cost-line">${costLine(mod.cost)}</div><div class="action-row"><button class="btn btn-small" data-action="op-module" data-id="${id}" ${G.canPay(mod.cost) ? '' : 'disabled'}>升级模组 ${mod.next}</button></div>`}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-head"><b>潜能</b><span>${s.potential} / 5</span></div>
        <div class="detail-section-body">
          <div class="potential-track">${[1, 2, 3, 4, 5].map(i => `<div class="pot-node ${i <= s.potential ? 'on' : ''}"><b>${i}</b><span>${i === 3 ? '技能+10%' : i === 5 ? '终结强化' : '属性+2%'}</span></div>`).join('')}</div>
          <div class="pot-effect">重复获得该干员时潜能 +1。潜能 3 与 5 会额外强化技能与基础属性。</div>
          ${s.potential < 5 ? `<div class="action-row"><button class="btn btn-small" data-action="op-token" data-id="${id}" ${G.itemCount('token') > 0 ? '' : 'disabled'}>使用通用信物（${G.itemCount('token')}）</button></div>` : ''}
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-head"><b>时装</b><span>${allSkins.length} 套 · 已拥有 ${allSkins.filter(sk => G.skinOwned(id, sk.id)).length}</span></div>
        <div class="detail-section-body">
          <div class="skin-strip">${skinCards}</div>
          ${defaultScaleBlock}
          <div class="detail-note">时装售价 ${SKIN_PRICE} 源石。源石由首通与挂机源石碎片获得。当前拥有 ◆ ${fmt(state.primes)}。</div>
        </div>
      </div>
    </div>
  </div>`;
  openModal(modalShell(`干员档案 · ${esc(d.name)}`, body, { wide: true, kicker: 'OPERATOR FILE // ' + d.cls, sub: d.sub + ' · ' + d.rarity + '★' }), { silent: opts.silent });
}

// ── gacha ─────────────────────────────────────────────────────────
function renderGacha() {
  const banner = BANNERS.find(b => b.id === ui.bannerId) || BANNERS[0];
  const featured = G.OP_BY_ID.get(banner.featured6);
  const featured5 = G.OP_BY_ID.get(banner.featured5);
  const pool = G.bannerPool(banner);
  const sixPool = pool.standard || pool.six || [];
  const roster = [...sixPool].sort((a, b) => (a.id === banner.featured6 ? -1 : b.id === banner.featured6 ? 1 : 0)).slice(0, 12);
  const pity = state.gacha[banner.id];
  const sel = G.selectorProgress();
  const rates = [['6★', 2, '#ff9b3d'], ['5★', 8, '#ffd166'], ['4★', 50, '#c58cff'], ['3★', 40, '#67a7e8']];
  const history = state.gacha.history.slice(0, 20).map(h => {
    const d = G.OP_BY_ID.get(h.id); if (!d) return '';
    return `<div class="history-row rarity-${d.rarity}"><img src="${G.portraitFor(d.id)}" alt=""><span class="hname">${esc(d.name)}</span><span class="hrar">${'★'.repeat(d.rarity)}</span><span class="htime">${new Date(h.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span></div>`;
  }).join('');

  return `<section class="page gacha-page">
    ${pageHead('HEADHUNT // RECRUITMENT', '寻访终端', `
      ${statHead('累计寻访', state.gacha.totalPulls)}
      ${statHead('六星自选', sel.available, ' 次')}
      ${statHead('源石', fmt(state.primes), ' ◆')}
    `)}
    <div class="banner-tabs">
      ${BANNERS.map(b => {
        const p = state.gacha[b.id];
        return `<button class="banner-tab ${b.id === banner.id ? 'active' : ''}" style="--banner-accent:${b.accent}" data-action="banner" data-id="${b.id}">
          <b>${b.name}</b><span>${b.subtitle}</span><span>保底 ${p.since6}/50 · 累计 ${p.total}</span>
        </button>`;
      }).join('')}
    </div>
    <div class="banner-hero" style="--banner-accent:${banner.accent}">
      <div class="banner-roster">
        <div class="roster-head"><span>可抽出 6★</span><b>${sixPool.length}</b><em>POOL WINDOW</em></div>
        <div class="roster-grid">
          ${roster.map(o => `<div class="roster-op ${o.id === banner.featured6 ? 'featured' : ''}" title="${esc(o.name)}">
            <img src="${G.portraitFor(o.id)}" alt="${esc(o.name)}" loading="lazy">
            <span>${esc(o.name)}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="banner-content">
        <span class="banner-tag">${banner.tag} · ${banner.subtitle}</span>
        <h2>${esc(featured?.name || '')}<br><em>${esc(banner.name)}</em></h2>
        <div class="banner-sub">RATE UP // ${banner.featured6.toUpperCase()}</div>
        <p class="banner-desc">${esc(banner.desc)}</p>
        <div class="banner-featured">
          <div class="featured-op"><img src="${featured?.img || ''}" alt=""><div><b>${esc(featured?.name || '')}</b><span>6★ · ${banner.pool === 'limited' ? '全部限定混合' : banner.pool === 'collab' ? '全部联动混合' : '常驻混合'}</span></div></div>
          <div class="featured-op"><img src="${featured5?.img || ''}" alt=""><div><b>${esc(featured5?.name || '')}</b><span>5★ · ${banner.pool === 'standard' ? '常驻混合' : '对应池混合'}</span></div></div>
        </div>
        <div class="banner-pull-row">
          <button class="btn btn-primary btn-large" data-action="pull" data-banner="${banner.id}" data-count="10" ${state.orundum >= PULL_COST * 10 ? '' : 'disabled'}>十连寻访 <span class="mono" style="font-size:10px;opacity:.8">${fmt(PULL_COST * 10)} ◇</span></button>
          <button class="btn btn-small" data-action="pull" data-banner="${banner.id}" data-count="1" ${state.orundum >= PULL_COST ? '' : 'disabled'}>单次 ${PULL_COST} ◇</button>
          <span class="pull-price">十连必得 5★ 以上</span>
        </div>
        <div class="pity-box">
          <div class="pity-item">六星保底<b>${pity.since6} / 50</b></div>
          <div class="pity-item">距离硬保底<b>${Math.max(0, 99 - pity.since6)} 抽</b></div>
          <div class="pity-item">本池累计<b>${pity.total}</b></div>
        </div>
      </div>
    </div>

    <div class="gacha-lower">
      <div class="panel">
        <div class="panel-head"><div class="panel-title">寻访规则 / 概率</div><span class="panel-meta">ORIGINAL RATE</span></div>
        <div class="panel-body">
          <div class="rate-bar">${rates.map(([, v, c]) => `<div class="rate-seg" style="width:${v}%;background:${c}"></div>`).join('')}</div>
          <div class="rate-legend">${rates.map(([n, v, c]) => `<span>${n}<b style="color:${c}">${v}%</b></span>`).join('')}</div>
          <div class="divider"></div>
          <div class="gacha-notes">• 6★ 基础概率 2%；连续 50 抽未获得 6★ 后，每抽概率 +2%。<br>• 标准、限定、联动卡池分别计算保底，不共享水位。<br>• 每累计 300 抽，可获得 1 次任意 6★ 自选兑换。<br>• 重复干员转化为潜能；满潜后转化为资质凭证。</div>
          <div class="action-row mt-12"><button class="btn btn-small" data-action="pool-six">查看本池全部 6★（${sixPool.length}）</button></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title">300 抽自选</div><span class="panel-meta">${sel.available ? 'AVAILABLE' : 'CHARGING'}</span></div>
        <div class="panel-body">
          <div class="kv"><span>本轮进度</span><b>${Math.min(sel.current, SELECTOR_COST)} / ${SELECTOR_COST}</b></div>
          <div class="progress mt-8"><i style="width:${Math.min(100, sel.current / SELECTOR_COST * 100)}%"></i></div>
          <div class="small mt-8">每 300 抽可自选一名任意 6★ 干员，包含限定与联动。可兑换次数会累积。</div>
          <button class="btn btn-primary btn-small mt-12" data-action="selector" ${sel.available ? '' : 'disabled'}>${sel.available ? '选择 6★ 干员（' + sel.available + '）' : '累计满 300 抽后开放'}</button>
          <div class="divider"></div>
          <div class="small">当前合成玉约 <b class="orange">${(state.orundum / PULL_COST).toFixed(1)}</b> 抽。挂机收益会按所选关卡持续增长。</div>
        </div>
      </div>
      <div class="panel" style="grid-column:1/-1">
        <div class="panel-head"><div class="panel-title">近期寻访记录</div><span class="panel-meta">LAST 20</span></div>
        <div class="panel-body history-list">${history || '<div class="small">暂无寻访记录。</div>'}</div>
      </div>
    </div>
  </section>`;
}

function openPoolSix() {
  const banner = BANNERS.find(b => b.id === ui.bannerId) || BANNERS[0];
  const pool = G.bannerPool(banner);
  const six = pool.standard || pool.six || [];
  const body = `<div class="pool-six-head"><div class="kv"><span>当前卡池</span><b>${esc(banner.name)}</b></div><div class="kv"><span>可抽出 6★</span><b class="orange">${six.length}</b></div></div>
    <div class="pool-six-grid">${six.map(o => `<button class="pool-six-card rarity-${o.rarity}" data-action="operator" data-id="${o.id}">
      <img src="${G.portraitFor(o.id)}" alt="${esc(o.name)}" loading="lazy">
      <div><b>${esc(o.name)}</b><span>${esc(o.cls)} · ${o.limited ? '限定' : o.collab ? '联动' : '常驻'}</span></div>
    </button>`).join('')}</div>`;
  openModal(modalShell(`卡池六星 · ${banner.name}`, body, { kicker: 'HEADHUNT // POOL WINDOW', wide: true, sub: '当前概率与卡池规则下可抽出的全部六星干员。' }));
}

function openPullOverlay(result) {
  closePullOverlay(true);
  const { results, banner } = result;
  const six = results.filter(r => r.rarity === 6);
  const five = results.filter(r => r.rarity === 5);
  const news = results.filter(r => r.isNew);
  const cards = results.map((r, i) => {
    const d = r.op;
    return `<div class="pull-card rarity-${d.rarity}" style="animation-delay:${i * 55}ms;--rarity:${STAR_COLOR[d.rarity]}">
      <img src="${d.img}" alt="${esc(d.name)}" loading="lazy">
      <span class="pc-border"></span>
      ${r.isNew ? '<span class="pc-new">NEW</span>' : r.potentialUp ? '<span class="pc-pot">P+1</span>' : r.maxed ? '<span class="pc-pot">满潜</span>' : ''}
      <div class="pc-info"><div class="pc-stars">${'★'.repeat(d.rarity)}</div><div class="pc-name">${esc(d.name)}</div><div class="pc-tag">${d.cls} / ${d.sub}</div></div>
    </div>`;
  }).join('');
  const root = document.createElement('div');
  root.className = 'pull-overlay';
  root.id = 'pullOverlay';
  root.innerHTML = `<div class="pull-head"><div class="eyebrow">HEADHUNT RESULT // ${esc(banner.name)}</div><h2>寻访结果</h2><p>${six.length ? 'SIX STAR SIGNAL DETECTED' : five.length ? 'FIVE STAR SIGNAL' : 'TRANSMISSION COMPLETE'}</p></div>
    <div class="pull-grid ${results.length === 1 ? 'single' : ''}">${cards}</div>
    <div class="pull-summary"><span>6★ × ${six.length}</span><span>5★ × ${five.length}</span><span>新干员 × ${news.length}</span><span>资质凭证已入账</span></div>
    <div class="pull-actions"><button class="btn btn-ghost" data-action="pull-close">确认</button><button class="btn btn-primary" data-action="pull-again" data-banner="${banner.id}" data-count="${results.length}">再次寻访</button></div>`;
  document.body.appendChild(root);
  ui.pullOverlay = { bannerId: banner.id, count: results.length };
  sfx('pull');
  if (six.length) setTimeout(() => sfx('gold'), 500);
  if (six.length) {
    const flash = el('div', 'pull-rarity-flash');
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 900);
  }
}

function closePullOverlay(silent = false) {
  $('#pullOverlay')?.remove();
  ui.pullOverlay = null;
  if (!silent) { sfx('close'); if (ui.view === 'gacha') setView('gacha', true); }
}

function openSelector() {
  const available = G.selectorsAvailable();
  const six = OPERATORS.filter(o => o.rarity === 6).sort((a, b) => Number(G.owned(b.id)) - Number(G.owned(a.id)) || a.name.localeCompare(b.name, 'zh'));
  const cards = six.map(d => {
    const o = state.operators[d.id];
    return `<button class="selector-card rarity-${d.rarity} ${o ? 'owned' : ''}" data-action="select-six" data-id="${d.id}" ${available > 0 ? '' : 'disabled'} style="--rarity:${STAR_COLOR[d.rarity]}">
      <img src="${d.img}" alt="${esc(d.name)}" loading="lazy">
      <div><b>${esc(d.name)}</b><span>${o ? '已拥有 · 潜能 +1' : 'NEW'}</span></div>
    </button>`;
  }).join('');
  const progress = G.selectorProgress();
  openModal(modalShell('六星自选兑换', `<div class="selector-info"><b>${available}</b> 次可兑换 · 本轮进度 ${Math.min(progress.current, SELECTOR_COST)} / ${SELECTOR_COST}</div><div class="progress"><i style="width:${Math.min(100, progress.current / SELECTOR_COST * 100)}%"></i></div><div class="selector-grid">${cards}</div>`, { wide: true, kicker: 'SELECTOR // 300 PULLS', sub: available ? '选择任意一名 6★ 干员。已拥有则提升 1 点潜能。' : '每累计 300 抽获得一次自选机会。' }), {});
}

// ── skins ────────────────────────────────────────────────────────
function renderSkins() {
  const q = ui.skinFilter.q.trim().toLowerCase();
  const list = SKINS.filter(s => {
    const op = G.OP_BY_ID.get(s.opId);
    if (!op) return false;
    if (ui.skinFilter.cls !== 'all' && op.cls !== ui.skinFilter.cls) return false;
    if (ui.skinFilter.owned && !state.skins.owned[s.id]) return false;
    if (q && !(`${s.name} ${op.name} ${s.series}`.toLowerCase().includes(q))) return false;
    return true;
  });
  const owned = Object.keys(state.skins.owned).length;
  const cards = list.map(sk => {
    const op = G.OP_BY_ID.get(sk.opId);
    const isOwned = !!state.skins.owned[sk.id];
    const opOwned = G.owned(sk.opId);
    const eq = state.skins.equipped[sk.opId] === sk.key;
    const actionLabel = !opOwned ? '暂未获取该干员' : eq ? '已经穿戴' : isOwned ? '穿戴' : `◆ ${SKIN_PRICE}`;
    return `<div class="gallery-card ${isOwned ? 'owned' : ''}" style="--skin-color:${sk.color}">
      <img src="${sk.img}" alt="${esc(sk.name)}" loading="lazy">
      <div class="gallery-info"><b>${esc(sk.name)}</b><span>${esc(op.name)} · ${esc(sk.series || '常驻')}</span>
        <button class="btn btn-small ${eq ? 'btn-cyan' : isOwned && opOwned ? 'btn-primary' : ''}" data-action="gallery-skin" data-id="${sk.id}" ${!opOwned || (!isOwned && state.primes < SKIN_PRICE) ? 'disabled' : ''}>${actionLabel}</button>
        ${isOwned || eq
          ? `<div class="skin-scale-row"><div class="skin-scale-head"><label><span>战斗小人缩放</span><b data-skin-scale-value="${sk.id}">${Math.round(G.skinScale(sk.id) * 100)}%</b></label><button class="skin-scale-reset" data-action="reset-skin-scale" data-id="${sk.id}" title="重置为 100%">↺</button></div><input type="range" min="50" max="200" step="1" value="${Math.round(G.skinScale(sk.id) * 100)}" data-skin-scale="${sk.id}" aria-label="${esc(sk.name)} 战斗小人缩放"></div>`
          : `<div class="skin-scale-locked">购买后可调整战斗小人大小</div>`}
      </div>
    </div>`;
  }).join('');
  return `<section class="page">
    ${pageHead('SKIN ARCHIVE // ' + SKINS.length, '时装商店', `
      ${statHead('全部时装', SKINS.length)}
      ${statHead('已拥有', owned)}
      ${statHead('当前源石', fmt(state.primes), ' ◆')}
    `)}
    <div class="skin-store-head">
      <div class="page-head-right" style="gap:14px">
        <span class="small">全量时装 · 统一售价 <b class="orange">18 源石</b></span>
        <button class="filter-btn ${ui.skinFilter.owned ? 'active' : ''}" data-action="skin-owned">仅看已购买</button>
      </div>
      <div class="filter-group" style="margin-top:10px">
        <span class="filter-label">职业</span>
        <button class="filter-btn ${ui.skinFilter.cls === 'all' ? 'active' : ''}" data-action="skin-class" data-value="all">全</button>
        ${CLASSES.map(c => `<button class="filter-btn ${ui.skinFilter.cls === c ? 'active' : ''}" data-action="skin-class" data-value="${c}" style="color:${CLASS_COLOR[c]}">${CLASS_GLYPH[c]}</button>`).join('')}
        <input id="skinSearch" class="skin-search" placeholder="搜索干员或时装…" value="${esc(ui.skinFilter.q)}">
      </div>
    </div>
    <div class="gallery-grid skin-store-grid">${cards || '<div class="empty-state">没有匹配的时装。</div>'}</div>
  </section>`;
}

// ── base ─────────────────────────────────────────────────────────
function roomCombatRows(r, s) {
  const labels = { crit: '暴击率', critDmg: '暴击伤害', atk: '全队攻击', aspd: '攻击速度', heal: '治疗量', hp: '生命上限' };
  return Object.entries(r.combat || {}).filter(([k]) => labels[k]).map(([k, per]) => {
    const capped = k === 'crit' && s.level >= G.CONTROL_MAX_LEVEL;
    return { label: labels[k], cur: s.damaged ? 0 : per * s.level * 100, per: per * 100, capped, damaged: !!s.damaged };
  });
}

function roomCombatText(r, s) {
  const rows = roomCombatRows(r, s);
  if (!rows.length) return '';
  return rows.map(x => `<span>${x.label} 当前 <b>+${x.cur.toFixed(2)}%</b><small>${x.damaged ? '设施受损 · 加成归零' : x.capped ? '已封顶' : `每级 +${x.per.toFixed(2)}%`}</small></span>`).join('');
}

function roomOutputText(r) {
  const s = state.base.rooms[r.id];
  if (s.damaged) return '<b class="red">设施受损 · 产出停止</b>';
  switch (r.effect) {
    case 'lmd': return `龙门币 <b>+${fmt(G.roomRate(r.id) * 3600)}/h</b>`;
    case 'record': return `作战记录 <b>+${fmt(G.roomRate(r.id) * 3600)} 经验/h</b>`;
    case 'block': return `基建材料块 <b>+${(G.roomRate(r.id) * 3600).toFixed(1)}/h</b>`;
    case 'material': return `技巧概要 <b>+${(G.roomRate(r.id) * 3600).toFixed(1)}/h</b>`;
    case 'book': return `技巧概要 <b>+${(G.roomRate(r.id) * 3600).toFixed(1)}/h</b>`;
    case 'global': return `全舰产出 <b>+${((r.rate * (s.level - 1)) * 100).toFixed(1)}%</b>`;
    case 'repair': return `固定维修 <b>3.00万</b>`;
    default: return '';
  }
}

// ── inventory ─────────────────────────────────────────────────────
function itemCard(id, m) {
  const count = G.itemCount(id);
  return `<button class="item-card" style="--item-color:${m.color}" data-action="item" data-id="${id}">
    <span class="item-count">${fmt(count)}</span>
    <div class="item-icon">${m.glyph}</div>
    <div class="item-name">${esc(m.name)}</div>
    <div class="item-tier">${'◆'.repeat(Math.min(5, m.tier || 1))} ${m.kind}</div>
  </button>`;
}

function renderInventory() {
  const tabs = [
    ['all', '全部'], ['record', '作战记录'], ['book', '技巧概要'], ['chip', '芯片'], ['special', '特殊'],
  ];
  if (!tabs.some(([id]) => id === ui.invTab)) ui.invTab = 'all';
  const useful = (id) => G.USEFUL_ITEM_IDS.has(id);
  const counts = { all: 0, record: 0, book: 0, chip: 0, special: 0 };
  for (const [id, m] of Object.entries(MATERIALS)) {
    if (!useful(id)) continue;
    if (!G.itemCount(id) && !['base_block', 'module', 'token'].includes(id)) continue;
    const k = m.kind === 'chip' || m.kind === 'chip_pack' ? 'chip' : m.kind === 'module' || m.kind === 'token' || m.kind === 'base' ? 'special' : m.kind;
    counts.all++; counts[k] = (counts[k] || 0) + 1;
  }
  const items = Object.entries(MATERIALS).filter(([id, m]) => {
    if (!useful(id)) return false;
    if (ui.invTab === 'all') return G.itemCount(id) > 0 || ['base_block', 'module', 'token'].includes(id);
    if (ui.invTab === 'chip') return (m.kind === 'chip' || m.kind === 'chip_pack') && G.itemCount(id) > 0;
    if (ui.invTab === 'special') return ['module', 'token', 'base'].includes(m.kind) && (G.itemCount(id) > 0 || id === 'base_block');
    return m.kind === ui.invTab;
  }).sort((a, b) => b[1].tier - a[1].tier || a[1].name.localeCompare(b[1].name, 'zh'));
  const invGrid = items.map(([id, m]) => itemCard(id, m)).join('');
  const shop = SHOP_ITEMS.map(item => {
    const stock = state.shop.stock[item.id] ?? 0;
    return `<div class="shop-row"><div><b>${item.name} ×${item.qty}</b><small>${item.desc}</small></div><span class="shop-cost">▤ ${item.cost}</span><button class="btn btn-small" data-action="buy-shop" data-id="${item.id}" ${stock <= 0 || state.distinction < item.cost ? 'disabled' : ''}>${stock > 0 ? '兑换 · 余 ' + stock : '售罄'}</button></div>`;
  }).join('');
  const skinCount = Object.keys(state.skins.owned).length;
  return `<section class="page">
    ${pageHead('DEPOT // SUPPLY', '仓库与交易所', `
      ${statHead('龙门币', fmt(state.lmd))}
      ${statHead('源石', fmt(state.primes))}
      ${statHead('时装', skinCount, ' / ' + SKINS.length)}
    `)}
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:12px">
      <div class="stat-card"><span>合成玉</span><b>${fmt(state.orundum)}</b></div>
      <div class="stat-card"><span>源石碎片</span><b>${Math.floor(state.primeShards)}/${PRIME_SHARD_COST}</b></div>
      <div class="stat-card"><span>资质凭证</span><b>${fmt(state.distinction)}</b></div>
      <div class="stat-card"><span>基建材料块</span><b>${fmt(G.itemCount('base_block'))}</b></div>
    </div>
    <div class="inv-tabs">${tabs.map(([id, name]) => `<button class="filter-btn ${ui.invTab === id ? 'active' : ''}" data-action="inv-tab" data-id="${id}">${name} ${counts[id] || 0}</button>`).join('')}</div>
    <div class="inv-grid">${invGrid || '<div class="empty-state">该分类暂无物资。</div>'}</div>
    <div class="shop-section">
      <div class="panel">
        <div class="panel-head"><div class="panel-title">凭证交易所</div><span class="panel-meta">DAILY STOCK</span></div>
        <div class="panel-body shop-list">${shop}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title">时装回廊</div><span class="panel-meta">SKIN ARCHIVE</span></div>
        <div class="panel-body">
          <div class="kv"><span>已拥有时装</span><b>${skinCount} / ${SKINS.length}</b></div>
          <div class="kv"><span>当前源石</span><b class="orange">◆ ${fmt(state.primes)}</b></div>
          <div class="progress mt-8"><i style="width:${skinCount / SKINS.length * 100}%"></i></div>
          <div class="small mt-12">时装统一售价 ${SKIN_PRICE} 源石。源石由关卡首通与挂机碎片获得。<br>每 20 个源石碎片合成 1 枚源石。</div>
          <button class="btn btn-small mt-12" data-action="skin-gallery">浏览全部 ${SKINS.length} 套时装</button>
        </div>
      </div>
    </div>
  </section>`;
}

// ── archive ───────────────────────────────────────────────────────
function renderEvents() {
  const log = (state.randomEvent?.log || []).map(e => ({ ...e, operator: e.operator || '罗德岛', tone: e.tone || 'neutral' }));
  const f = ui.eventFilter;
  const rangeMs = { all: Infinity, '1h': 3600e3, '24h': 86400e3, '7d': 604800e3 }[f.range] || Infinity;
  const now = Date.now();
  const operators = [...new Set(log.map(e => e.operator))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const filtered = log.filter(e =>
    (f.operator === 'all' || e.operator === f.operator) &&
    (f.outcome === 'all' || (f.outcome === 'gain' ? e.tone === 'good' : f.outcome === 'loss' ? e.tone === 'bad' : e.tone === 'neutral')) &&
    (rangeMs === Infinity || now - e.at <= rangeMs)
  );
  const gains = log.filter(e => e.tone === 'good').length;
  const losses = log.filter(e => e.tone === 'bad').length;
  const rows = filtered.map(e => `<div class="event-log-row ${e.tone}">
    <div class="event-log-time">${esc(timeAgo(e.at))}<small>${new Date(e.at).toLocaleString('zh-CN', { hour12: false })}</small></div>
    <div class="event-log-op">${esc(e.operator)}</div>
    <div class="event-log-main"><b>${esc(e.title)}</b><span>${esc(e.text || '')}</span></div>
    <div class="event-log-result ${e.tone}">${esc(e.result)}</div>
  </div>`).join('');
  return `<section class="page">
    ${pageHead('RHODES ISLAND // INCIDENT ARCHIVE', '事件日志', `
      ${statHead('记录总数', log.length)}
      ${statHead('收益事件', gains)}
      ${statHead('损失事件', losses)}
    `)}
    <div class="panel">
      <div class="event-filters">
        <label>时间<select data-event-filter="range">
          ${[['all','全部'],['1h','最近 1 小时'],['24h','最近 24 小时'],['7d','最近 7 天']].map(([v,n]) => `<option value="${v}" ${f.range===v?'selected':''}>${n}</option>`).join('')}
        </select></label>
        <label>干员<select data-event-filter="operator">
          <option value="all">全部干员</option>
          ${operators.map(o => `<option value="${esc(o)}" ${f.operator===o?'selected':''}>${esc(o)}</option>`).join('')}
        </select></label>
        <label>结果<select data-event-filter="outcome">
          ${[['all','全部'],['gain','收益'],['loss','损失'],['neutral','中性']].map(([v,n]) => `<option value="${v}" ${f.outcome===v?'selected':''}>${n}</option>`).join('')}
        </select></label>
        <span class="small">当前显示 ${filtered.length} / ${log.length} 条</span>
      </div>
    </div>
    <div class="event-log-list">
      ${rows || '<div class="empty-state">没有符合筛选条件的事件。</div>'}
    </div>
  </section>`;
}

function renderArchive() {
  const wins = state.stats.wins || 0;
  const achievements = [
    ['初次执勤', wins >= 1, '完成 1 次作战'],
    ['十连寻访', state.gacha.totalPulls >= 10, '累计寻访 10 次'],
    ['六星降临', Object.keys(state.operators).some(id => G.OP_BY_ID.get(id)?.rarity === 6), '获得任意 6★ 干员'],
    ['精英二', Object.keys(state.operators).some(id => state.operators[id].elite >= 2), '将任意干员精英化二'],
    ['百战', wins >= 100, '累计胜利 100 次'],
    ['基建狂魔', ROOMS.some(r => state.base.rooms[r.id].level >= 10), '任意设施达到 10 级'],
    ['她来了', G.owned('wisadel'), '获得维什戴尔'],
    ['时装收藏', Object.keys(state.skins.owned).length >= 1, '购买 1 套时装'],
  ];
  return `<section class="page">
    ${pageHead('RHODES ISLAND // SETTINGS', '设置', `${statHead('累计作战', fmt(state.stats.runs))}${statHead('源石', fmt(state.primes))}${statHead('值守时长', (state.stats.offlineSec / 3600).toFixed(1), ' h')}`)}
    <div class="archive-grid">
      <div class="panel">
        <div class="panel-head"><div class="panel-title">系统设置</div><span class="panel-meta">PRTS CONFIG</span></div>
        <div class="panel-body">
          <div class="setting-row"><div>音效<small>战斗、抽卡与界面反馈</small></div><button class="switch ${state.settings.sound ? 'on' : ''}" data-action="setting" data-key="sound"></button></div>
          <div class="setting-row"><div>自动释放技能<small>干员技力满时自动触发</small></div><button class="switch ${state.settings.autoSkill ? 'on' : ''}" data-action="setting" data-key="autoSkill"></button></div>
          <div class="setting-row"><div>减少动态效果<small>降低扫光与闪烁动画</small></div><button class="switch ${state.settings.reduceMotion ? 'on' : ''}" data-action="setting" data-key="reduceMotion"></button></div>
          <div class="setting-row setting-slider-row">
            <div>战斗小人缩放（全局）<small>与皮肤单独缩放相乘 · 50%–200%</small></div>
            <div class="setting-slider"><input id="charScale" type="range" min="0.5" max="2" step="0.05" value="${state.settings.characterScale ?? 1.2}"><b id="charScaleValue">${Math.round((state.settings.characterScale ?? 1.2) * 100)}%</b></div>
          </div>
          <div class="setting-row setting-slider-row">
            <div>敌方单位大小<small>小兵与 Boss 同步缩放 · 50%–200%</small></div>
            <div class="setting-slider"><input id="enemyScale" type="range" min="0.5" max="2" step="0.05" value="${state.settings.enemyScale ?? 1}"><b id="enemyScaleValue">${Math.round((state.settings.enemyScale ?? 1) * 100)}%</b></div>
          </div>
          <div class="setting-row"><div>新手提示<small>重新查看三页上手说明</small></div><button class="btn btn-small" data-action="tutorial">查看</button></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title">存档管理</div><span class="panel-meta">SAVE DATA</span></div>
        <div class="panel-body">
          <div class="small">存档保存在当前浏览器 localStorage。更换浏览器或清理缓存会丢失进度，建议定期导出。</div>
          <div class="action-row">
            <button class="btn btn-small" data-action="export-save">导出加密存档</button>
            <button class="btn btn-small" data-action="import-save">导入存档</button>
            <button class="btn btn-small btn-danger" data-action="reset-save">重置档案</button>
          </div>
          <div class="divider"></div>
          <div class="credits">
            <b>罗德岛值守协议</b> · 非官方同人放置游戏 v1.0.0<br>
            干员、皮肤与设定素材来自 <a href="https://prts.wiki/" target="_blank" rel="noopener">PRTS Wiki</a>，版权归上海鹰角网络科技有限公司所有。<br>
            本作不进行任何商业销售，仅用于学习与同人展示。UI、玩法改编与代码为同人创作。<br>
            特别鸣谢：PRTS Wiki 编辑组、所有在罗德岛值班的博士。
          </div>
        </div>
      </div>
    </div>
    <div class="archive-hero">
      <div class="id-card">
        <div class="id-mark">R</div>
        <div class="id-name">博士</div>
        <div class="id-role">RHODES ISLAND // COMMANDER</div>
        <div class="id-stats">
          <div class="id-stat"><span>LEVEL</span><b>${state.doctor.level}</b></div>
          <div class="id-stat"><span>今日升级</span><b>${G.doctorTodayLevels()} / 5</b></div>
          <div class="id-stat"><span>WINS</span><b>${fmt(wins)}</b></div>
          <div class="id-stat"><span>PULLS</span><b>${fmt(state.gacha.totalPulls)}</b></div>
          <div class="id-stat"><span>SKINS</span><b>${Object.keys(state.skins.owned).length}</b></div>
        </div>
      </div>
      <div>
        <div class="stats-grid">
          <div class="stat-card"><span>作战次数</span><b>${fmt(state.stats.runs)}</b></div>
          <div class="stat-card"><span>胜利</span><b>${fmt(wins)}</b></div>
          <div class="stat-card"><span>击杀</span><b>${fmt(state.stats.kills)}</b></div>
          <div class="stat-card"><span>精英化</span><b>${fmt(state.stats.promotions)}</b></div>
          <div class="stat-card"><span>累计寻访</span><b>${fmt(state.gacha.totalPulls)}</b></div>
          <div class="stat-card"><span>累计维修</span><b>${fmt(state.stats.repairs)}</b></div>
          <div class="stat-card"><span>维什戴尔爆炸</span><b>${fmt(state.base.sabotageCount)}</b></div>
          <div class="stat-card"><span>离线收益</span><b>${(state.stats.offlineSec / 3600).toFixed(1)}h</b></div>
        </div>
        <div class="panel mt-12">
          <div class="panel-head"><div class="panel-title">成长记录</div><span class="panel-meta">ACHIEVEMENTS</span></div>
          <div class="panel-body"><div class="badge-grid">${achievements.map(([n, on, desc]) => `<span class="badge ${on ? 'on' : ''}" title="${desc}">${on ? '✓ ' : '○ '}${n}</span>`).join('')}</div></div>
        </div>
        <div class="panel mt-12">
          <div class="panel-head"><div class="panel-title">随机事件记录</div><span class="panel-meta">INCIDENTS</span></div>
          <div class="panel-body">
            ${(state.randomEvent?.log || []).length
              ? `<div class="event-log">${state.randomEvent.log.slice(0, 8).map(e => `<div class="event-row"><b>${esc(e.title)}</b><span class="${e.tone === 'bad' ? 'red' : e.tone === 'good' ? 'green' : 'orange'}">${esc(e.result)}</span></div>`).join('')}</div>`
              : '<div class="small">暂无记录。干员们目前都很安静。</div>'}
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

// ── tasks / squad / item / skins / offline / sabotage ─────────────
function openTasks() {
  G.ensureDaily();
  const supply = state.daily.supplyClaimed
    ? `<div class="supply-card"><div class="sc-icon">✓</div><div><b>今日补给已领取</b><span>明天再来。</span></div></div>`
    : `<div class="supply-card"><div class="sc-icon">◆</div><div><b>每日值守补给</b><span>300 合成玉 · 10,000 龙门币 · 作战记录</span></div><button class="btn btn-primary btn-small" data-action="daily-supply">领取</button></div>`;
  const tasks = DAILY_TASKS.map(t => {
    const p = G.taskProgress(t);
    const claimed = state.daily.claimed.includes(t.id);
    return `<div class="task-row">
      <div class="task-name">${t.name}</div>
      <div class="task-prog">${claimed ? '已领取' : p + ' / ' + t.target}</div>
      <div class="progress"><i style="width:${Math.min(100, p / t.target * 100)}%"></i></div>
      <div class="task-rewards">${t.rewards.lmd ? `<span>L <b>${fmt(t.rewards.lmd)}</b></span>` : ''}${t.rewards.orundum ? `<span>◇ <b>${t.rewards.orundum}</b></span>` : ''}${Object.entries(t.rewards.items || {}).map(([id, n]) => `<span>${MATERIALS[id]?.glyph || id} <b>${n}</b></span>`).join('')}</div>
      <button class="btn btn-small ${claimed ? '' : 'btn-primary'}" data-action="claim-task" data-id="${t.id}" ${claimed || p < t.target ? 'disabled' : ''}>${claimed ? '已领取' : '领取'}</button>
    </div>`;
  }).join('');
  openModal(modalShell('日常任务', `${supply}${tasks}<div class="small mt-12">任务进度每日 00:00 重置。没有理智限制，所有任务都可以通过挂机完成。</div>`, { narrow: true, kicker: 'DAILY // ' + state.daily.date }));
}

function openSquadEditor() {
  const slots = state.squad.map((id, i) => {
    if (!id) return `<button class="squad-slot empty" data-action="squad-slot" data-slot="${i}">+ 空位 ${i + 1}</button>`;
    const d = G.OP_BY_ID.get(id); const s = state.operators[id];
    return `<div class="squad-slot rarity-${d.rarity}" data-action="remove-squad" data-id="${id}" title="点击下阵" style="--rarity:${STAR_COLOR[d.rarity]}"><img class="sq-img" src="${G.portraitFor(id)}" alt=""><div class="sq-info"><div class="sq-name">${esc(d.name)}</div><div class="sq-sub">E${s.elite} L${s.level}</div></div></div>`;
  }).join('');
  const owned = OPERATORS.filter(o => G.owned(o.id)).sort((a, b) => G.opPower(b.id) - G.opPower(a.id));
  const roster = owned.map(d => {
    const inSquad = state.squad.includes(d.id);
    return `<button class="roster-pick ${inSquad ? 'in' : ''}" data-action="squad-add" data-id="${d.id}" ${inSquad ? 'disabled' : ''} style="--rarity:${STAR_COLOR[d.rarity]}"><img src="${G.portraitFor(d.id)}" alt="" loading="lazy"><span>${esc(d.name)}</span><small>PWR ${fmt(G.opPower(d.id))}</small></button>`;
  }).join('');
  openModal(modalShell('编队配置', `<div class="squad-editor-slots">${slots}</div><div class="divider"></div><div class="flex-between"><div class="panel-title">可用干员</div><span class="small">点击加入编队 · 总战力 ${fmt(G.squadPower())}</span></div><div class="roster-picker">${roster}</div>`, { wide: true, kicker: 'FORMATION // 5 SLOTS', sub: '5 人横版编队：近战靠前，远程与医疗在后。' }));
}

function openItem(id) {
  const m = MATERIALS[id];
  if (!m) return;
  openModal(modalShell(m.name, `<div class="item-detail"><div class="item-icon" style="--item-color:${m.color};width:58px;height:58px;font-size:22px">${m.glyph}</div><div><div class="kv"><span>持有数量</span><b>${fmt(G.itemCount(id))}</b></div><div class="kv"><span>分类</span><b>${m.kind}</b></div><div class="kv"><span>稀有度</span><b>${'◆'.repeat(Math.min(5, m.tier || 1))}</b></div><p class="small mt-12">${esc(m.desc || '')}</p></div></div>`, { narrow: true, kicker: 'MATERIAL // DEPOT' }));
}

function openSkinGallery() {
  const ownedOnly = ui.galleryOwned;
  const list = SKINS.filter(s => !ownedOnly || state.skins.owned[s.id]);
  const cards = list.map(sk => {
    const op = G.OP_BY_ID.get(sk.opId);
    const owned = state.skins.owned[sk.id];
    const eq = state.skins.equipped[sk.opId] === sk.key;
    return `<div class="gallery-card" style="--skin-color:${sk.color}">
      <img src="${sk.img}" alt="${esc(sk.name)}" loading="lazy">
      <div class="gallery-info"><b>${esc(sk.name)}</b><span>${esc(op.name)} · ${esc(sk.series)}</span>
        <button class="btn btn-small ${eq ? '' : 'btn-primary'}" data-action="gallery-skin" data-id="${sk.id}" ${!owned && state.primes < SKIN_PRICE ? 'disabled' : ''}>${eq ? '已装备' : owned ? '装备' : '◆ ' + SKIN_PRICE}</button>
      </div>
    </div>`;
  }).join('');
  openModal(modalShell('时装回廊', `<div class="flex-between mb-12"><span class="small">${list.length} / ${SKINS.length} 套 · 当前 ◆ ${fmt(state.primes)}</span><button class="btn btn-small ${ui.galleryOwned ? 'active' : ''}" data-action="gallery-owned">${ownedOnly ? '显示全部' : '仅显示已拥有'}</button></div><div class="gallery-grid">${cards || '<div class="empty-state">还没有时装。</div>'}</div>`, { wide: true, kicker: 'SKIN ARCHIVE // PRTS', sub: '全部时装统一售价 ' + SKIN_PRICE + ' 源石。' }));
}

export function showRandomEvent({ event, result }) {
  const tone = event.tone === 'bad' ? 'red' : event.tone === 'good' ? 'green' : 'orange';
  const body = `<div class="random-event-card">
    <div class="random-event-kicker">OPERATOR INCIDENT // ${esc(event.id.toUpperCase())}</div>
    <h4>${esc(event.title)}</h4>
    <p>${esc(event.text)}</p>
    <div class="random-event-result ${tone}">${esc(result)}</div>
  </div>`;
  openModal(modalShell('干员随机事件', body, {
    narrow: true,
    kicker: 'RHODES ISLAND // INCIDENT REPORT',
    actions: '<button class="btn btn-primary" data-action="close-modal">知道了</button>',
  }));
  if (event.tone === 'bad') sfx('warn'); else sfx('gold');
}

export function showOffline(report) {
  if (!report) return;
  const hours = report.seconds / 3600;
  const items = Object.entries(report.items).filter(([, n]) => n > 0).slice(0, 12).map(([id, n]) => `<span class="offline-item">${MATERIALS[id]?.glyph || id} ${MATERIALS[id]?.name || id} <b>×${fmt(n)}</b></span>`).join('');
  const body = `<div class="offline-time">离线时长 ${hours.toFixed(2)} 小时${report.capped ? '（结算上限 ' + OFFLINE_CAP_HOURS + ' 小时）' : ''} · 当前挂机关卡 ${esc(report.stage?.code || '')} ${esc(report.stage?.name || '')}</div>
    <div class="offline-grid mt-12">
      <div class="offline-stat"><span>合成玉</span><b>+${fmt(report.orundum)}</b></div>
      <div class="offline-stat"><span>折合寻访</span><b>+${report.pulls.toFixed(1)} 抽</b></div>
      <div class="offline-stat"><span>源石</span><b>+${fmt(report.primes)} ◆</b></div>
      <div class="offline-stat"><span>龙门币</span><b>+${fmt(report.lmd)}</b></div>
      <div class="offline-stat"><span>源石碎片</span><b>+${fmt(report.shards)}</b></div>
      <div class="offline-stat"><span>基建材料块</span><b>+${fmt(report.items.base_block || 0)}</b></div>
    </div>
    ${items ? `<div class="offline-items">${items}</div>` : ''}
    <div class="small mt-12">挂机收益按所选关卡的固定速率结算，胜负不影响。关闭自动作战则不会获得寻访资源。</div>`;
  openModal(modalShell('离线值守报告', body, { narrow: true, kicker: 'PRTS // OFFLINE REPORT', actions: '<button class="btn btn-primary" data-action="close-modal">继续值守</button>' }));
}

export function showSabotage({ room, entry }) {
  if (ui.pullOverlay) { toast(`警告：${room.name} 被炸毁，维修费用 ${fmt(entry.cost)} LMD`, 'error', 5200); return; }
  const body = `<div class="warning-box"><b>结构爆炸警报</b><br>${entry.source === '不明爆炸物' ? '来源不明的爆炸物' : '维什戴尔'}炸毁了 <b>${esc(room.name)}</b>。设施产出与等级加成已暂停，维修需要 <b>${fmt(entry.cost)}</b> 龙门币。</div>
    <div class="small mt-12">“我只是想确认这面墙是不是承重墙。”<br>—— 维什戴尔（否认全部指控）</div>`;
  openModal(modalShell('紧急结构警报', body, { narrow: true, kicker: 'ALERT // STRUCTURAL FAILURE', actions: `<button class="btn btn-ghost" data-action="close-modal">稍后处理</button><button class="btn btn-danger" data-action="repair-room" data-id="${room.id}" ${state.lmd >= G.repairCost(room.id) ? '' : 'disabled'}>紧急维修 · ${fmt(G.repairCost(room.id))}</button>` }));
}

// ── tutorial ──────────────────────────────────────────────────────
const TUTORIAL = [
  { title: '编队与职业协同', body: '一个编队可以放 5 名干员。近战干员在前排阻挡敌人，远程与医疗在后排输出；队伍会在横版战场中向前推进。同职业上阵 2 人以上会激活攻击加成。', hint: '点击“编成”调整队伍，或使用“自动编队”。' },
  { title: '无理智自动作战', body: '选关后会自动部署并循环作战。战斗失败不会停止挂机，合成玉、源石碎片与基建材料仍会按关卡速率持续积累。', hint: '前期一小时约 10 抽，十五章一小时约 30 抽。' },
  { title: '抽卡、养成与罗德岛', body: '初始拥有 100 抽。每 300 抽可自选任意 6★。干员有 5 点潜能、精英化、技能专精与模组。基建无限升级，但每级只加很小的暴击、暴伤与治疗。', hint: '小心维什戴尔。她真的会炸。' },
];

export function startTutorial(force = false) {
  if (state.tutorialDone && !force) return;
  ui.tutorialStep = 0;
  renderTutorial();
}
function renderTutorial() {
  const root = $('#tutorialRoot');
  const step = TUTORIAL[ui.tutorialStep];
  root.innerHTML = `<div class="tutorial-backdrop"><div class="tutorial-card">
    <div class="tutorial-step">ORIENTATION // ${ui.tutorialStep + 1} OF ${TUTORIAL.length}</div>
    <h3>${step.title}</h3>
    <p>${step.body}</p>
    <div class="tutorial-dots">${TUTORIAL.map((_, i) => `<i class="${i <= ui.tutorialStep ? 'on' : ''}"></i>`).join('')}</div>
    <div class="tutorial-actions"><button class="btn btn-ghost btn-small" data-action="tutorial-skip">跳过</button><button class="btn btn-primary btn-small" data-action="tutorial-next">${ui.tutorialStep === TUTORIAL.length - 1 ? '开始值班' : '下一步'}</button></div>
  </div></div>`;
}
function endTutorial() {
  G.setTutorialDone();
  $('#tutorialRoot').innerHTML = '';
}

// ── actions ───────────────────────────────────────────────────────
async function onClick(e) {
  const deployToken = e.target.closest('.ally-token[data-action="deploy-select"]');
  if (ui.deploying && deployToken) {
    e.preventDefault();
    startDeploy(deployToken.dataset.id);
    return;
  }
  if (ui.deploying && e.target.closest('#arena') && !e.target.closest('button, .arena-hud, .arena-bottom, .arena-result')) {
    e.preventDefault();
    placeDeployment(e.clientX, e.clientY);
    return;
  }
  const target = e.target.closest('[data-action]');
  if (!target) return;
  if (target.disabled) return;
  const action = target.dataset.action;
  if (action === 'modal-close' || action === 'close-modal') { e.preventDefault(); closeModal(); return; }
  if (action !== 'pull-again') sfx('click');
  const id = target.dataset.id;
  switch (action) {
    case 'view':
      e.preventDefault(); setView(target.dataset.view); break;
    case 'stage-group':
      ui.stageGroup = target.dataset.group;
      if (ui.stageGroup === 'main') ui.mainChapter = G.STAGE_BY_ID.get(state.stage.selected)?.chapterKey ?? 0;
      if (ui.stageGroup === 'endless') {
        const endless = STAGES.filter(s => s.group === 'endless');
        const current = endless.reduce((a, b) => !a || b.floor > a.floor ? b : a, null);
        if (current) { G.setStage(current.id); battle.start(current.id); }
      }
      renderView(); break;
    case 'select-stage': {
      if (!G.setStage(id)) { toast('该关卡尚未解锁，请先通关前置关卡。', 'warn'); break; }
      battle.start(id); ui.stageGroup = G.STAGE_BY_ID.get(id).group; renderView(); toast(`已切换至 ${G.STAGE_BY_ID.get(id).code} · ${G.STAGE_BY_ID.get(id).name}`, 'success'); break;
    }
    case 'speed':
      battle.setSpeed(Number(target.dataset.speed)); renderView(); break;
    case 'pause':
      battle.togglePause(); syncArena(); break;
    case 'toggle-auto':
      battle.setAuto(!state.stage.auto); toast(state.stage.auto ? '自动循环开启。失败也会继续挂机。' : '自动循环关闭。', state.stage.auto ? 'success' : 'warn'); syncArena(); break;
    case 'next-stage':
      if (battle.nextStageId && battle.nextStageId !== battle.stage.id) battle.start(battle.nextStageId);
      else battle.start();
      renderView(); break;
    case 'exit-battle':
      state.stage.auto = false;
      battle.exit();
      renderView(); break;
    case 'restart':
      battle.start(); renderView(); break;
    case 'refresh-battle':
      battle.start(); renderView(); break;
    case 'open-squad':
      openSquadEditor(); break;
    case 'deploy-select':
      startDeploy(id); break;
    case 'toggle-deploy':
      ui.gridVisible = !ui.gridVisible;
      ui.deploying = null;
      ui.showRanges = false;
      renderRangeOverlay();
      renderView();
      toast(ui.gridVisible ? '部署模式：点击干员，再点击战场格子。' : '已退出部署模式。', 'success');
      break;
    case 'toggle-ranges':
      ui.showRanges = !ui.showRanges;
      renderRangeOverlay();
      renderView();
      break;
    case 'op-deploy':
      closeModal(true);
      setView('battle');
      setTimeout(() => startDeploy(id), 80);
      break;
    case 'amiya-form':
      openOperator(id); break;
    case 'auto-squad':
      G.autoSquad(); battle.start(); renderView(); toast('已按战力自动编队。', 'success'); break;
    case 'remove-squad':
      G.removeFromSquad(id);
      ui.squadDirty = true;
      if ($('#modalRoot').children.length) openSquadEditor(); else renderView();
      break;
    case 'squad-add':
      if (G.addToSquad(id)) { ui.squadDirty = true; openSquadEditor(); }
      else toast('编队已满或干员已在队伍中。', 'warn');
      break;
    case 'squad-slot':
      toast('从下方列表选择干员加入空位。', 'info'); break;
    case 'tasks':
      openTasks(); break;
    case 'claim-task':
      if (G.claimTask(id)) { toast('任务奖励已领取。', 'success'); openTasks(); updateChrome(); }
      break;
    case 'daily-supply':
      if (G.claimDailySupply()) { toast('每日补给已领取。', 'success'); openTasks(); updateChrome(); }
      break;
    case 'op-filter': {
      const kind = target.dataset.kind;
      if (kind === 'owned') ui.filter.owned = !ui.filter.owned;
      else ui.filter[kind] = kind === 'rarity' ? Number(target.dataset.value) : target.dataset.value;
      renderView(); break;
    }
    case 'op-sort': {
      const order = ['rarity', 'power', 'level', 'name'];
      ui.filter.sort = order[(order.indexOf(ui.filter.sort) + 1) % order.length];
      renderView(); break;
    }
    case 'operator':
      openOperator(id); break;
    case 'op-level': {
      const times = Number(target.dataset.times || 1);
      const gained = G.levelUp(id, times);
      if (gained) { toast(`等级提升 ${gained} 级。`, 'success'); openOperator(id, { silent: true }); updateChrome(); }
      else toast('作战记录或龙门币不足。', 'warn');
      break;
    }
    case 'op-promote':
      if (G.promote(id)) { toast('精英化完成。等级上限已提升。', 'success'); sfx('upgrade'); openOperator(id, { silent: true }); updateChrome(); }
      else toast('精英化材料不足。', 'warn');
      break;
    case 'op-skill':
      if (G.trainSkill(id)) { toast('技能训练完成。', 'success'); openOperator(id, { silent: true }); }
      else toast('技能训练材料不足。', 'warn');
      break;
    case 'op-module':
      if (G.upgradeModule(id)) { toast('模组升级完成。', 'success'); openOperator(id, { silent: true }); }
      else toast('模组材料不足。', 'warn');
      break;
    case 'op-token':
      if (G.useToken(id)) { toast('潜能提升 1 点。', 'success'); openOperator(id, { silent: true }); }
      else toast('通用信物不足，或潜能已满。', 'warn');
      break;
    case 'op-buy-skin':
      if (G.buySkin(id)) { toast('时装已购买并装备。', 'success'); sfx('gold'); openOperator(target.dataset.op, { silent: true }); updateChrome(); }
      else toast(`源石不足，需要 ${SKIN_PRICE} 枚。`, 'warn');
      break;
    case 'reset-skin-scale': {
      G.setSkinScale(id, 1);
      const row = target.closest('.skin-scale-row');
      const input = row?.querySelector('[data-skin-scale]');
      const label = row?.querySelector('b');
      if (input) input.value = '100';
      if (label) label.textContent = '100%';
      if (ui.view === 'battle') battle?.start(state.stage.selected);
      break;
    }
    case 'op-skin-default': {
      const opId = target.dataset.op;
      if (G.equipSkin(opId, null)) { toast('已更换为默认皮肤。', 'success'); openOperator(opId, { silent: true }); }
      break;
    }
    case 'op-skin': {
      const sk = SKIN_BY_ID.get(id);
      if (sk && G.equipSkin(sk.opId, sk.key)) { toast('已更换时装。', 'success'); openOperator(sk.opId, { silent: true }); }
      break;
    }
    case 'banner':
      ui.bannerId = id; renderView(); break;
    case 'pool-six':
      openPoolSix(); break;
    case 'pull': {
      const r = G.pull(target.dataset.banner, Number(target.dataset.count));
      if (r.error) { toast(r.error + (r.need ? `（需要 ${fmt(r.need)}）` : ''), 'warn'); break; }
      openPullOverlay(r); updateChrome(); break;
    }
    case 'pull-close':
      closePullOverlay(); break;
    case 'pull-again': {
      const b = target.dataset.banner, c = Number(target.dataset.count);
      $('#pullOverlay')?.remove(); ui.pullOverlay = null;
      const r = G.pull(b, c);
      if (r.error) { toast(r.error, 'warn'); setView('gacha', true); break; }
      openPullOverlay(r); updateChrome(); break;
    }
    case 'selector':
      openSelector(); break;
    case 'select-six': {
      const r = G.claimSixStarSelector(id);
      if (r) { toast(r.maxed ? `${r.op.name} 已满潜，转化为 30 资质凭证。` : `${r.isNew ? '获得' : '潜能提升'}：${r.op.name}`, 'success'); sfx('gold'); openSelector(); updateChrome(); }
      else toast('没有可用的 300 抽自选次数。', 'warn');
      break;
    }
    case 'base-upgrade':
      if (G.upgradeRoom(id)) { toast('设施升级完成。', 'success'); sfx('upgrade'); renderView(); }
      else toast('升级所需龙门币或基建材料块不足。', 'warn');
      break;
    case 'repair-room':
      if (G.repairRoom(id)) { toast('设施维修完成，产出恢复。', 'success'); sfx('repair'); closeModal(true); renderView(); }
      else toast('龙门币不足，无法维修。', 'warn');
      break;
    case 'repair-all': {
      const r = G.repairAll();
      if (r.ok) { toast(`已维修 ${r.count} 座设施，消耗 ${fmt(r.total)} 龙门币。`, 'success'); sfx('repair'); closeModal(true); renderView(); }
      else toast(`龙门币不足，需要 ${fmt(r.total)}。`, 'warn');
      break;
    }
    case 'inv-tab':
      ui.invTab = id; renderView(); break;
    case 'item':
      openItem(id); break;
    case 'buy-shop':
      if (G.buyShop(id)) { toast('兑换完成。', 'success'); openItem(id); renderView(); updateChrome(); }
      else toast('资质凭证不足或今日售罄。', 'warn');
      break;
    case 'skin-gallery':
      openSkinGallery(); break;
    case 'gallery-owned':
      ui.galleryOwned = !ui.galleryOwned; openSkinGallery(); break;
    case 'skin-owned':
      ui.skinFilter.owned = !ui.skinFilter.owned; renderView(); break;
    case 'skin-class':
      ui.skinFilter.cls = target.dataset.value; renderView(); break;
    case 'gallery-skin': {
      const sk = SKINS.find(s => s.id === id);
      if (!sk) break;
      if (G.skinOwned(sk.opId, sk.id)) { G.equipSkin(sk.opId, sk.key); toast('已装备时装。', 'success'); }
      else if (G.buySkin(sk.id)) { toast(`时装已购买并装备（18 源石）。`, 'success'); sfx('gold'); }
      else toast(`源石不足，需要 ${SKIN_PRICE} 枚。`, 'warn');
      if (ui.view === 'skins') renderView(); else openSkinGallery();
      updateChrome(); break;
    }
    case 'setting': {
      const key = target.dataset.key;
      state.settings[key] = !state.settings[key];
      G.saveNow(); updateChrome();
      if (ui.view === 'archive') renderView();
      break;
    }
    case 'tutorial':
      startTutorial(true); break;
    case 'tutorial-next':
      if (ui.tutorialStep >= TUTORIAL.length - 1) endTutorial();
      else { ui.tutorialStep += 1; renderTutorial(); }
      break;
    case 'tutorial-skip':
      endTutorial(); break;
    case 'export-save': {
      G.saveNow();
      try {
        const raw = localStorage.getItem(SAVE_KEY) || '{}';
        const encrypted = await encryptSave(JSON.parse(raw));
        const blob = new Blob([JSON.stringify(encrypted)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `rhodes-idle-save-${new Date().toISOString().slice(0, 10)}.json`;
        a.click(); URL.revokeObjectURL(a.href);
        toast('存档已加密导出。', 'success');
      } catch (e) {
        toast('存档导出失败：当前浏览器不支持加密。', 'error');
      }
      break;
    }
    case 'import-save':
      document.getElementById('saveImport')?.click(); break;
    case 'reset-save':
      openModal(modalShell('重置档案', `<div class="warning-box"><b>此操作不可撤销。</b><br>所有干员、抽卡记录、基建与关卡进度将被清除。导出的 JSON 存档仍可重新导入。</div>`, { narrow: true, kicker: 'DANGER // RESET', actions: '<button class="btn btn-ghost" data-action="close-modal">取消</button><button class="btn btn-danger" data-action="confirm-reset">确认重置</button>' }));
      break;
    case 'confirm-reset':
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem('rhodes_idle_tutorial_v1');
      location.reload(); break;
    default:
      console.warn('Unhandled action', action);
  }
}

// ── monthly update loop ──────────────────────────────────────────
export function tick(dt) {
  ui.chromeTimer += dt;
  if (ui.chromeTimer >= 0.45) { ui.chromeTimer = 0; updateChrome(); }
  if (ui.view === 'battle' && battle) {
    syncArena();
  } else if (ui.view === 'base') {
    updateBaseDynamic();
  }
}

export function showOfflineReport(report) { showOffline(report); }

function renderBase() {
  const sum = G.baseSummary();
  const powerGain = G.baseLevelPowerGain();
  const damaged = ROOMS.filter(r => state.base.rooms[r.id].damaged);
  const rooms = ROOMS.map(r => {
    const s = state.base.rooms[r.id];
    const cost = G.roomUpgradeCost(r.id);
    const levelMul = 1 + 0.12 * (s.level - 1);
    return `<div class="room-card ${s.damaged ? 'damaged' : ''}" style="--room-color:${r.color}">
      ${s.damaged ? '<span class="room-damage-tag">DAMAGED</span>' : ''}
      <div class="room-head">
        <div class="room-glyph">${r.glyph}</div>
        <div><div class="room-name">${r.name}</div><div class="room-level">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= Math.min(5, s.level) ? 'on' : ''}"></i>`).join('')}<span class="mono" style="font-size:8px;color:var(--dim);margin-left:3px">LV.${s.level}</span></div></div>
      </div>
      <div class="room-desc">${r.desc}</div>
      <div class="room-output">${roomOutputText(r)}</div>
      <div class="room-combat">${roomCombatText(r, s)}</div>
      <div class="room-actions">
        ${s.damaged ? `<button class="btn btn-small btn-danger" data-action="repair-room" data-id="${r.id}" ${state.lmd >= G.repairCost(r.id) ? '' : 'disabled'}>维修 ${fmt(G.repairCost(r.id))}</button>` : `<button class="btn btn-small" data-action="base-upgrade" data-id="${r.id}" ${G.canPay(cost) && G.canUpgradeRoom(r.id) ? '' : 'disabled'}>${G.canUpgradeRoom(r.id) ? `升级 · L${fmt(cost.lmd)} + ${cost.items.base_block} 块` : '暴击率已封顶'}</button>`}
      </div>
      <div class="room-timer"><i style="width:${Math.min(100, (s.level % 5) * 20 + 10)}%"></i></div>
    </div>`;
  }).join('');
  const log = state.base.sabotageLog.map(e => `<div class="sabotage-row"><span class="s-icon">✖</span><div class="s-main"><b>${esc(e.name)}</b> 被炸毁<br><small>${esc(e.source)} · ${timeAgo(e.at)}</small></div><span class="s-cost">-${fmt(e.cost)} LMD</span></div>`).join('');
  return `<section class="page">
    ${pageHead('RHODES ISLAND // INFRASTRUCTURE', '基建管理', `
      ${statHead('全舰效率', (sum.global * 100).toFixed(1), '%')}
      ${statHead('受损设施', damaged.length, ' / ' + ROOMS.length)}
      ${statHead('材料块', fmt(G.itemCount('base_block')), ' 块')}
    `)}
    <div class="base-summary">
      <div class="base-summary-card"><span>龙门币 / 小时</span><b>${fmt(sum.lmdPerHour)}</b></div>
      <div class="base-summary-card"><span>经验 / 小时</span><b>${fmt(sum.recordPerHour)}</b></div>
      <div class="base-summary-card"><span>材料块 / 小时</span><b>${sum.blockPerHour.toFixed(1)}</b></div>
      <div class="base-summary-card"><span>暴击率</span><b>${(sum.bonuses.crit * 100).toFixed(2)}%</b></div>
      <div class="base-summary-card"><span>暴击伤害</span><b>${(sum.bonuses.critDmg * 100).toFixed(0)}%</b></div>
    </div>
    <div class="rooms-grid">${rooms}</div>
    <div class="panel mt-12">
      <div class="panel-head"><div class="panel-title">基建加成明细</div><span class="panel-meta">CURRENT / PER LEVEL</span></div>
      <div class="panel-body base-bonus-table">
        <div class="base-bonus-row head"><span>设施</span><span>当前加成</span><span>每级提升</span><span>状态</span></div>
        ${ROOMS.map(r => { const s = state.base.rooms[r.id]; const rows = roomCombatRows(r, s); return rows.map((x, i) => `<div class="base-bonus-row"><span>${i === 0 ? esc(r.name) + ' <small>LV.' + s.level + '</small>' : ''}</span><span>${x.label} <b>+${x.cur.toFixed(2)}%</b></span><span>+${x.per.toFixed(2)}%</span><span>${x.damaged ? '设施受损 · 加成归零' : x.capped ? '暴击已封顶' : '可继续升级'}</span></div>`).join(''); }).join('')}
      </div>
    </div>
    <div class="base-lower">
      <div class="panel">
        <div class="panel-head"><div class="panel-title">结构安全监测</div><span class="panel-meta">${damaged.length ? 'ALERT' : 'NOMINAL'}</span></div>
        <div class="panel-body">
          <div class="wisadel-panel">
            <img src="${G.OP_BY_ID.get('wisadel')?.img}" alt="维什戴尔">
            <div><h4>维什戴尔协议</h4><p>她拥有随时“测试承重结构”的自由。每 2 分钟进行一次爆炸判定：基础 0.6%，拥有维什戴尔 +0.4%，编队中再 +0.3%。维修费用随设施等级上升。</p></div>
          </div>
          <div class="kv mt-12"><span>下次结构判定</span><b id="baseSabotagePct">${Math.min(100, state.base.sabotageTimer / 120 * 100).toFixed(0)}%</b></div>
          <div class="progress red mt-8"><i id="baseSabotageBar" style="width:${Math.min(100, state.base.sabotageTimer / 120 * 100)}%"></i></div>
          <div class="divider"></div>
          ${log || '<div class="small">暂无破坏记录。这是一件好事。</div>'}
          ${damaged.length ? `<button class="btn btn-danger btn-small mt-12" data-action="repair-all">全部维修 · ${fmt(damaged.reduce((s, r) => s + G.repairCost(r.id), 0))} LMD</button>` : ''}
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title">全舰加成</div><span class="panel-meta">UNLIMITED UPGRADE</span></div>
        <div class="panel-body">
          <div class="kv"><span>全队攻击</span><b>+${(sum.bonuses.atk * 100).toFixed(2)}%</b></div>
          <div class="kv"><span>全队生命</span><b>+${(sum.bonuses.hp * 100).toFixed(2)}%</b></div>
          <div class="kv"><span>攻击速度</span><b>+${(sum.bonuses.aspd * 100).toFixed(2)}%</b></div>
          <div class="kv"><span>治疗量</span><b>+${(sum.bonuses.heal * 100).toFixed(2)}%</b></div>
          <div class="kv"><span>暴击率</span><b>${(sum.bonuses.crit * 100).toFixed(2)}%</b></div>
          <div class="kv"><span>暴击伤害</span><b>${(sum.bonuses.critDmg * 100).toFixed(0)}%</b></div>
          <div class="kv"><span>全基升 1 级战力</span><b>+${fmt(powerGain)}</b></div>
          <div class="divider"></div>
          <div class="small">设施等级无上限；控制中枢在暴击率达到 100% 时封顶。每级只提供很小的固定加成，升级成本会持续上升。<br>材料块主要来自挂机：前期约 1.2 块/小时，后期约 3.2 块/小时。</div>
          <div class="kv mt-12"><span>受损维修费</span><b>30,000 / 设施</b></div>
        </div>
      </div>
    </div>
  </section>`;
}

