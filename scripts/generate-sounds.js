/**
 * Generates the game's sound effects as original synthesized tones (16-bit PCM
 * WAV, mono, 22.05 kHz). No third-party audio is used, so everything is fully
 * offline and license-free. Run: `node scripts/generate-sounds.js`.
 */
const fs = require('fs');
const path = require('path');

const SR = 22050;
const OUT = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(OUT, { recursive: true });

function envelope(t, dur, attack = 0.006, release = 0.06) {
  if (t < attack) return t / attack;
  if (t > dur - release) return Math.max(0, (dur - t) / release);
  return 1;
}

function tone(freq, dur, opts = {}) {
  const { type = 'sine', vol = 0.55, attack = 0.006, release = 0.06 } = opts;
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ph = 2 * Math.PI * freq * t;
    let s;
    if (type === 'square') s = Math.sign(Math.sin(ph));
    else if (type === 'saw') s = 2 * ((freq * t) % 1) - 1;
    else if (type === 'tri') s = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
    else s = Math.sin(ph);
    out[i] = s * vol * envelope(t, dur, attack, release);
  }
  return out;
}

function chord(freqs, dur, opts = {}) {
  const parts = freqs.map((f) => tone(f, dur, { ...opts, vol: (opts.vol ?? 0.5) / freqs.length }));
  const out = new Float32Array(parts[0].length);
  for (const p of parts) for (let i = 0; i < out.length; i++) out[i] += p[i];
  return out;
}

function concat(...parts) {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Float32Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function toWav(float32) {
  const n = float32.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buf;
}

const sounds = {
  // pleasant rising two-note ding
  correct: concat(tone(660, 0.09, { vol: 0.5 }), tone(988, 0.14, { vol: 0.55 })),
  // low buzzer
  wrong: tone(146, 0.3, { type: 'square', vol: 0.35, release: 0.12 }),
  // short high blip
  tick: tone(1250, 0.05, { vol: 0.45, release: 0.02 }),
  // descending horn
  timeUp: concat(
    tone(392, 0.16, { type: 'saw', vol: 0.4 }),
    tone(311, 0.16, { type: 'saw', vol: 0.4 }),
    tone(233, 0.36, { type: 'saw', vol: 0.42, release: 0.16 }),
  ),
  // rising fanfare
  roundWin: concat(
    tone(523, 0.11, { vol: 0.5 }),
    tone(659, 0.11, { vol: 0.5 }),
    tone(784, 0.12, { vol: 0.5 }),
    tone(1047, 0.24, { vol: 0.55, release: 0.12 }),
  ),
  // celebratory arpeggio + final chord
  gameWin: concat(
    tone(523, 0.1, { vol: 0.5 }),
    tone(659, 0.1, { vol: 0.5 }),
    tone(784, 0.1, { vol: 0.5 }),
    tone(1047, 0.12, { vol: 0.5 }),
    chord([523, 659, 784, 1047], 0.55, { vol: 0.6, release: 0.28 }),
  ),
};

for (const [name, data] of Object.entries(sounds)) {
  const file = path.join(OUT, `${name}.wav`);
  fs.writeFileSync(file, toWav(data));
  console.log(`wrote ${file} (${data.length} samples)`);
}
