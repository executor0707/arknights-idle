import {
  state, loadGame, applyOffline, saveNow, tickBase, tickIdle,
} from './game.js';
import * as G from './game.js';
import { SAVE_KEY } from './data.js';
import { Battle } from './battle.js';
import { initUI, setView, tick, showOfflineReport, startTutorial, updateChrome } from './ui.js';
import { initAudio, sfx } from './audio.js';

const splash = document.getElementById('splash');
const app = document.getElementById('app');
const enterBtn = document.getElementById('enterBtn');
const enterLabel = document.getElementById('enterLabel');
const splashReset = document.getElementById('splashReset');
const clockEl = document.getElementById('splashClock');

let battle = null;
let running = false;
let last = performance.now();
let saveTimer = 0;
let booted = false;
let offlineReport = null;

function updateClock() {
  const d = new Date();
  if (clockEl) clockEl.textContent = d.toLocaleTimeString('zh-CN', { hour12: false });
}
updateClock();
setInterval(updateClock, 1000);

const hasSave = !!localStorage.getItem(SAVE_KEY);
if (enterLabel) enterLabel.textContent = hasSave ? '继续接入' : '建立博士档案';
if (splashReset) splashReset.classList.toggle('hidden', !hasSave);

splashReset?.addEventListener('click', () => {
  if (confirm('清除当前存档并重新开始？此操作不可撤销。')) {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem('rhodes_idle_tutorial_v1');
    location.reload();
  }
});

enterBtn?.addEventListener('click', boot);

function boot() {
  if (booted) return;
  booted = true;
  initAudio();
  sfx('open');
  loadGame();
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

function loop(ts) {
  if (!running) return;
  const dt = Math.min(0.1, Math.max(0, (ts - last) / 1000));
  last = ts;
  tickBase(dt);
  tickIdle(dt);
  battle?.tick(dt);
  tick(dt);
  saveTimer += dt;
  if (saveTimer >= 8) { saveTimer = 0; saveNow(); }
  requestAnimationFrame(loop);
}

document.addEventListener('visibilitychange', () => {
  if (!booted) return;
  if (document.hidden) {
    saveNow();
  } else {
    const report = applyOffline();
    if (report) {
      // 离线收益按时间推进，重新开一轮以刷新战场。
      battle.start(state.stage.selected);
      renderBattleView();
      showOfflineReport(report);
    }
    last = performance.now();
  }
});

function renderBattleView() {
  if (uiView() === 'battle') setView('battle', true);
}

function uiView() {
  const active = document.querySelector('.nav-item.active');
  return active?.dataset.nav || 'battle';
}

window.addEventListener('beforeunload', () => saveNow());

// 调试入口：仅用于本机验证与自动化 QA。
window.__RHODES__ = {
  get state() { return state; },
  get battle() { return battle; },
  save: saveNow,
  applyOffline,
  setView,
  G,
};
