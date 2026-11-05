import { state } from './game.js';

let ctx = null;
let master = null;

export function initAudio() {
  if (ctx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
  } catch (e) { ctx = null; }
}

function tone(freq, dur, type = 'sine', delay = 0, gain = 0.14, endFreq = null) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(master);
  osc.start(t); osc.stop(t + dur + 0.02);
}

function noise(dur, gain = 0.1, lowpass = 1800) {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lowpass;
  const g = ctx.createGain(); g.gain.value = gain;
  src.connect(f); f.connect(g); g.connect(master); src.start(t);
}

export function sfx(name) {
  if (!state.settings.sound || !ctx) return;
  switch (name) {
    case 'click': tone(520, 0.045, 'square', 0, 0.035, 720); break;
    case 'open': tone(320, 0.09, 'sine', 0, 0.06, 520); break;
    case 'close': tone(420, 0.07, 'sine', 0, 0.04, 260); break;
    case 'skill': tone(680, 0.25, 'sawtooth', 0, 0.06, 1400); tone(340, 0.3, 'sine', 0.02, 0.04, 900); break;
    case 'victory': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.35, 'triangle', i * 0.09, 0.075)); break;
    case 'defeat': tone(220, 0.6, 'sawtooth', 0, 0.06, 80); noise(0.5, 0.05, 500); break;
    case 'pull': [440, 554, 659, 880].forEach((f, i) => tone(f, 0.22, 'sine', i * 0.06, 0.05)); break;
    case 'gold': [523, 784, 1046, 1318].forEach((f, i) => tone(f, 0.5, 'triangle', i * 0.08, 0.08)); break;
    case 'warn': tone(880, 0.12, 'square', 0, 0.05); tone(660, 0.18, 'square', 0.14, 0.05); break;
    case 'breach': noise(0.25, 0.12, 900); tone(120, 0.25, 'sawtooth', 0, 0.08, 50); break;
    case 'repair': tone(300, 0.08, 'square', 0, 0.04, 500); tone(500, 0.1, 'square', 0.08, 0.04, 700); break;
    case 'upgrade': tone(600, 0.12, 'triangle', 0, 0.05, 900); tone(900, 0.18, 'triangle', 0.1, 0.05, 1200); break;
    case 'crit': tone(1200, 0.05, 'square', 0, 0.025, 1600); break;
    default: break;
  }
}
