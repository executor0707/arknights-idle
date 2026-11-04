import {
  state, loadGame, applyOffline, saveNow, tickBase, tickIdle,
} from './game.js';
import * as G from './game.js';
import { SAVE_KEY, SAVE_VERSION } from './data.js';
import { decodeSaveFile } from './save-codec.js';
import { Battle } from './battle.js';
import { initUI, setView, tick, showOfflineReport, startTutorial, updateChrome } from './ui.js';
import { initAudio, sfx } from './audio.js';

const splash = document.getElementById('splash');
const app = document.getElementById('app');
const enterBtn = document.getElementById('enterBtn');
const enterLabel = document.getElementById('enterLabel');
const splashReset = document.getElementById('splashReset');
const splashImport = document.getElementById('splashImport');
const splashImportFile = document.getElementById('splashImportFile');
const splashImportStatus = document.getElementById('splashImportStatus');
const clockEl = document.getElementById('splashClock');

let battle = null;
let running = false;
let last = performance.now();
let saveTimer = 0;
let eventTimer = 0;
let booted = false;
let offlineReport = null;
let backgroundTimer = null;
let backgroundLast = 0;

function updateClock() {
  const d = new Date();
  if (clockEl) clockEl.textContent = d.toLocaleTimeString('zh-CN', { hour12: false });
}
updateClock();
setInterval(updateClock, 1000);

// v3 storage generation: every previous save key and tutorial flag is retired.
for (const legacy of [
  'rhodes_island_idle_save_v1', 'rhodes_island_idle_save_v2',
  'rhodes_idle_tutorial_v1', 'rhodes_idle_tutorial_v2',
]) {
  localStorage.removeItem(legacy);
}
let hasSave = false;
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  hasSave = !!saved && saved.version === SAVE_VERSION && !!saved.operators;
} catch (e) { hasSave = false; }
if (enterLabel) enterLabel.textContent = hasSave ? '继续值守' : '建立博士档案';
if (splashReset) splashReset.classList.toggle('hidden', !hasSave);

splashReset?.addEventListener('click', () => {
  if (confirm('清除当前存档并重新开始？此操作不可撤销。')) {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem('rhodes_idle_tutorial_v3');
    location.reload();
  }
});

splashImport?.addEventListener('click', () => splashImportFile?.click());

splashImportFile?.addEventListener('change', async () => {
  const file = splashImportFile.files?.[0];
  if (!file) return;
  if (hasSave && !confirm('导入存档会覆盖当前进度，继续吗？')) {
    splashImportFile.value = '';
    return;
  }
  if (splashImport) splashImport.disabled = true;
  if (splashImportStatus) {
    splashImportStatus.className = 'splash-import-status';
    splashImportStatus.textContent = '正在读取存档…';
  }
  try {
    const parsed = JSON.parse(await file.text());
    const data = await decodeSaveFile(parsed);
    if (!data || !data.operators) throw new Error('存档中没有干员数据');
    window.__RHODES_IMPORTING__ = true;
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    if (splashImportStatus) {
      splashImportStatus.className = 'splash-import-status ok';
      splashImportStatus.textContent = `存档已读取：${Object.keys(data.operators).length} 名干员，正在开局…`;
    }
    setTimeout(boot, 350);
  } catch (e) {
    if (splashImportStatus) {
      splashImportStatus.className = 'splash-import-status bad';
      splashImportStatus.textContent = `导入失败：${e?.message || '文件格式错误或已损坏'}`;
    }
    splashImportFile.value = '';
  } finally {
    if (splashImport) splashImport.disabled = false;
  }
});

enterBtn?.addEventListener('click', boot);

function boot() {
  if (booted) return;
  booted = true;
  initAudio();
  sfx('open');
  loadGame();
  // The imported state is already in localStorage by this point. Clearing the
  // guard here lets every later normal unload persist the played state.
  window.__RHODES_IMPORTING__ = false;
  offlineReport = applyOffline();
  if (state.settings.reduceMotion) document.documentElement.classList.add('reduce-motion');

  battle = new Battle();
  battle.start(state.stage.selected);
  initUI(battle);
  app.classList.remove('hidden');
  splash.classList.add('out');
  setTimeout(() => splash.remove(), 760);

  updateChrome();
  if (offlineReport) setTimeout(() => showOfflineReport(offlineReport), 500);
  if (!state.tutorialDone) setTimeout(() => startTutorial(), offlineReport ? 600 : 950);
  running = true;
  last = performance.now();
  requestAnimationFrame(loop);
}

function simulate(dt, render = true) {
  if (!running) return;
  dt = Math.max(0, Math.min(60, dt));
  if (dt <= 0) return;
  tickBase(dt);
  tickIdle(dt);
  if (battle) {
    // Battle.tick caps a single step at 80 ms. Split the background delta so
    // combat, skills and auto-restarts still advance at the intended rate.
    const steps = Math.max(1, Math.min(1200, Math.ceil(dt / 0.05)));
    const part = dt / steps;
    for (let i = 0; i < steps; i++) battle.tick(part);
  }
  if (render) tick(dt);
  eventTimer += dt;
  if (eventTimer >= 2) { eventTimer = 0; G.checkRandomEvent(); }
  saveTimer += dt;
  if (saveTimer >= 8) { saveTimer = 0; saveNow(); }
}

function loop(ts) {
  if (!running) return;
  if (document.hidden) {
    last = ts;
    requestAnimationFrame(loop);
    return;
  }
  const dt = Math.min(0.1, Math.max(0, (ts - last) / 1000));
  last = ts;
  simulate(dt, true);
  requestAnimationFrame(loop);
}

function startBackgroundLoop() {
  if (backgroundTimer || !running) return;
  backgroundLast = performance.now();
  backgroundTimer = setInterval(() => {
    if (!running || !document.hidden) return;
    const now = performance.now();
    const dt = Math.max(0, (now - backgroundLast) / 1000);
    backgroundLast = now;
    simulate(dt, false);
  }, 1000);
}

function stopBackgroundLoop() {
  if (!backgroundTimer) return;
  clearInterval(backgroundTimer);
  backgroundTimer = null;
}

document.addEventListener('visibilitychange', () => {
  if (!booted) return;
  if (document.hidden) {
    // Keep the simulation running while the tab is in the background.
    saveNow();
    startBackgroundLoop();
  } else {
    stopBackgroundLoop();
    const now = performance.now();
    const gap = Math.max(0, (now - backgroundLast) / 1000);
    // Catch up if the browser throttled the background interval.
    if (gap > 0.1) simulate(gap, false);
    last = now;
    tick(0);
  }
});

function renderBattleView() {
  if (uiView() === 'battle') setView('battle', true);
}

function uiView() {
  const active = document.querySelector('.nav-item.active');
  return active?.dataset.nav || 'battle';
}

window.addEventListener('beforeunload', () => {
  // Merely opening and closing the splash screen must not create a save.
  if (booted && !window.__RHODES_IMPORTING__) saveNow();
});

// 调试入口：仅用于本机验证与自动化 QA。
window.__RHODES__ = {
  get state() { return state; },
  get battle() { return battle; },
  save: saveNow,
  applyOffline,
  setView,
  G,
};
