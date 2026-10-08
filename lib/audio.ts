'use client';

// Original instrumental, “Bulan Baru”: 16 bars, 88 BPM, Cmaj7–Am7–Fmaj7–G6.
// A single context and gain bus serve both music and effects. No audio downloads.
let context: AudioContext | null = null;
let master: GainNode | null = null;
let music: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextTime = 0;
let enabled = false;
let active = false;
const beat = 60 / 88;
const chords = [[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,64]];
const melody = [76,0,79,0,74,76,0,72, 72,0,76,79,0,76,72,0, 77,0,76,0,72,74,0,69, 71,0,74,76,0,74,72,0];

function ensureAudio() {
  if (!context || context.state === 'closed') {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = enabled ? .65 : 0;
    master.connect(context.destination);
  }
  void context.resume().catch(() => {});
  return context;
}

function note(ctx: AudioContext, bus: GainNode, midi: number, at: number, length: number, level: number, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(level, at + .018);
  gain.gain.exponentialRampToValueAtTime(.0001, at + length);
  osc.connect(gain); gain.connect(bus);
  osc.start(at); osc.stop(at + length + .02);
  osc.onended = () => { osc.disconnect(); gain.disconnect(); };
}

function schedule() {
  if (!context || !music || context.state !== 'running') return;
  // Restart the beat after a suspended tab; never queue a backlog of notes.
  if (nextTime < context.currentTime) nextTime = context.currentTime + .03;
  while (nextTime < context.currentTime + .18) {
    const chord = chords[Math.floor(step / 8) % 4];
    if (step % 8 === 0) {
      chord.forEach(n => note(context!, music!, n, nextTime, beat * 3.8, .022, 'triangle'));
    }
    if (step % 4 === 0) note(context, music, chord[0] - 24, nextTime, beat * 1.4, .13);
    const tune = melody[step % melody.length];
    if (tune) {
      note(context, music, tune + (step >= 64 ? 12 : 0), nextTime, beat * .85, .07);
      note(context, music, tune, nextTime + beat * .38, beat * .75, .018);
    }
    // Soft brushed pulse, with a short pitched kick on each downbeat.
    if (step % 2 === 0) note(context, music, 31, nextTime, .12, .07);
    if (step % 4 === 2) note(context, music, 91, nextTime, .045, .012, 'triangle');
    nextTime += beat / 2;
    step = (step + 1) % 128;
  }
}

function stopMusic() {
  if (timer !== null) clearInterval(timer);
  timer = null;
  // Disconnect the old bus, including already scheduled voices, before replacing it.
  music?.disconnect();
  music = null;
}

export function setGameAudio(soundEnabled: boolean, playing: boolean) {
  enabled = soundEnabled;
  active = playing;
  if (master && context) {
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(enabled ? .65 : 0, context.currentTime, .025);
  }
  if (!enabled || !active || (typeof document !== 'undefined' && document.hidden)) {
    stopMusic();
    return;
  }
  try {
    const ctx = ensureAudio();
    if (timer !== null) return;
    music = ctx.createGain(); music.connect(master!);
    music.gain.value = .8;
    nextTime = ctx.currentTime + .04;
    schedule();
    timer = setInterval(schedule, 75);
  } catch { stopMusic(); }
}

export function playTone(soundEnabled: boolean, high = false) {
  if (!soundEnabled) return;
  try {
    enabled = true;
    const ctx = ensureAudio();
    master!.gain.setTargetAtTime(.65, ctx.currentTime, .01);
    (high ? [72,76,79] : [67,72]).forEach((n,i) => note(ctx, master!, n, ctx.currentTime + i * .07, .24, .09));
  } catch { /* Gameplay still works on devices without Web Audio. */ }
}

export function syncAudioVisibility() { setGameAudio(enabled, active); }
