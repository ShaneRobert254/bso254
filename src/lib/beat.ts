type HitContext = BaseAudioContext;

const listeners = new Set<() => void>();

type Session = {
  ctx: AudioContext;
  master: GainNode;
  seed: number;
  duration: number;
  stepLen: number;
  step: number;
  nextTime: number;
  timer: number;
  onEnd?: () => void;
};

let session: Session | null = null;

export function onBeat(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function midi(note: number) {
  return 440 * 2 ** ((note - 69) / 12);
}

function noiseBuffer(ctx: HitContext) {
  const length = Math.floor(ctx.sampleRate * 0.4);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

const buffers = new WeakMap<HitContext, AudioBuffer>();

function noise(ctx: HitContext) {
  let buffer = buffers.get(ctx);
  if (!buffer) {
    buffer = noiseBuffer(ctx);
    buffers.set(ctx, buffer);
  }
  return buffer;
}

function tone(
  ctx: HitContext,
  master: AudioNode,
  time: number,
  freq: number,
  peak: number,
  decay: number,
  type: OscillatorType,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  osc.connect(gain);
  gain.connect(master);
  osc.start(time);
  osc.stop(time + decay + 0.02);
}

function hitNoise(
  ctx: HitContext,
  master: AudioNode,
  time: number,
  peak: number,
  decay: number,
  highpass: number,
) {
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = highpass;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(time);
  src.stop(time + decay + 0.02);
}

function scheduleHit(ctx: HitContext, master: AudioNode, time: number, step: number, seed: number) {
  const slot = step % 16;
  const bar = Math.floor(step / 16);
  const root = [36, 36, 41, 39, 43][ (seed + bar) % 5 ];
  if (slot === 0 || slot === 8 || (slot === 10 && seed % 2 === 0)) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(148, time);
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.09);
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.3);
  }
  if (slot === 4 || slot === 12) {
    tone(ctx, master, time, 196, 0.18, 0.12, "triangle");
    hitNoise(ctx, master, time, 0.34, 0.16, 1400);
  }
  if (slot % 2 === 0) {
    hitNoise(ctx, master, time, slot % 4 === 0 ? 0.08 : 0.14, 0.045, 6000);
  }
  if (slot === 0 || slot === 7 || slot === 8 || slot === 14) {
    const bounce = seed % 3 === 0 && slot === 14 ? 7 : 0;
    tone(ctx, master, time, midi(root - 12 + bounce), 0.28, 0.22, "sine");
  }
  if (slot === 0 || (slot === 12 && seed % 3 !== 1)) {
    const stab = [0, 3, 7, 10][(seed + bar) % 4];
    tone(ctx, master, time, midi(root + 12 + stab), 0.06, 0.18, "triangle");
  }
}

function bpmFor(seed: number) {
  return 88 + (seed % 10);
}

export function hashSeed(id: string) {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function arm(sessionNext: Session) {
  window.clearInterval(sessionNext.timer);
  sessionNext.timer = window.setInterval(() => {
    const lookAhead = sessionNext.ctx.currentTime + 0.25;
    while (sessionNext.nextTime < lookAhead) {
      const elapsed = sessionNext.step * sessionNext.stepLen;
      if (elapsed >= sessionNext.duration) {
        const done = sessionNext.onEnd;
        stopBeat();
        done?.();
        emit();
        return;
      }
      scheduleHit(sessionNext.ctx, sessionNext.master, sessionNext.nextTime, sessionNext.step, sessionNext.seed);
      sessionNext.nextTime += sessionNext.stepLen;
      sessionNext.step += 1;
    }
  }, 25);
}

export function startBeat(seed: number, duration: number, offset = 0, onEnd?: () => void) {
  stopBeat();
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(ctx.destination);
  const stepLen = 60 / bpmFor(seed) / 4;
  const step = Math.max(0, Math.round(offset / stepLen));
  const next: Session = {
    ctx,
    master,
    seed,
    duration,
    stepLen,
    step,
    nextTime: ctx.currentTime + 0.05,
    timer: 0,
    onEnd,
  };
  session = next;
  void ctx.resume();
  arm(next);
  emit();
}

export function stopBeat() {
  if (!session) return;
  window.clearInterval(session.timer);
  session.master.disconnect();
  void session.ctx.close();
  session = null;
  emit();
}

export function seekBeat(seconds: number) {
  if (!session) return;
  session.master.disconnect();
  const master = session.ctx.createGain();
  master.gain.value = 0.8;
  master.connect(session.ctx.destination);
  session.master = master;
  session.step = Math.max(0, Math.round(seconds / session.stepLen));
  session.nextTime = session.ctx.currentTime + 0.06;
  emit();
}

export function beatTime() {
  if (!session) return 0;
  const scheduled = session.step * session.stepLen;
  const audible = scheduled - (session.nextTime - session.ctx.currentTime);
  return Math.min(session.duration, Math.max(0, audible));
}

export function beatLive() {
  return session !== null;
}

function writeWav(buffer: AudioBuffer) {
  const channel = buffer.getChannelData(0);
  const samples = channel.length;
  const bytes = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(bytes);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples * 2, true);
  let offset = 44;
  for (let i = 0; i < samples; i += 1) {
    const sample = Math.max(-1, Math.min(1, channel[i] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return new Blob([bytes], { type: "audio/wav" });
}

export async function renderPreviewWav(seed: number, duration: number) {
  const rate = 22050;
  const ctx = new OfflineAudioContext(1, Math.ceil(rate * duration), rate);
  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(ctx.destination);
  const stepLen = 60 / bpmFor(seed) / 4;
  const steps = Math.floor(duration / stepLen);
  for (let step = 0; step < steps; step += 1) {
    scheduleHit(ctx, master, step * stepLen, step, seed);
  }
  const rendered = await ctx.startRendering();
  return writeWav(rendered);
}
