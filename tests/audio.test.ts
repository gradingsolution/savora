import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const nodes: { gain: { value: number; setTargetAtTime: ReturnType<typeof vi.fn> }; disconnect: ReturnType<typeof vi.fn> }[] = [];
let contexts = 0, voices = 0;
const visibility = { hidden: false };
class FakeContext {
  state = 'running'; currentTime = 0; destination = {};
  constructor() { contexts++; }
  resume = vi.fn(async () => {});
  createGain() {
    const node = { gain: { value: 0, cancelScheduledValues: vi.fn(), setTargetAtTime: vi.fn(), setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
    nodes.push(node); return node;
  }
  createOscillator() {
    voices++;
    return { type: '', frequency: { value: 0 }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null };
  }
}
beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); nodes.length = 0; contexts = 0; voices = 0; visibility.hidden = false; vi.stubGlobal('AudioContext', FakeContext); vi.stubGlobal('document', visibility); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('unified game audio', () => {
  it('starts a layered soundtrack only on explicit start, without duplicate contexts or timers', async () => {
    const { setGameAudio, playTone } = await import('../lib/audio');
    expect(contexts).toBe(0);
    setGameAudio(true, true);
    expect(voices).toBeGreaterThan(5);
    setGameAudio(true, true); playTone(true);
    expect(contexts).toBe(1); expect(vi.getTimerCount()).toBe(1);
  });
  it('master mute silences existing voices, stops music and blocks effects', async () => {
    const { setGameAudio, playTone } = await import('../lib/audio');
    setGameAudio(true, true); const before = voices;
    setGameAudio(false, true); playTone(false); vi.advanceTimersByTime(1000);
    expect(nodes[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 0, .025);
    expect(nodes[1].disconnect).toHaveBeenCalled(); expect(voices).toBe(before); expect(vi.getTimerCount()).toBe(0);
  });
  it('pauses in hidden tabs and resumes one scheduler when visible', async () => {
    const { setGameAudio, syncAudioVisibility } = await import('../lib/audio');
    setGameAudio(true, true); visibility.hidden = true; syncAudioVisibility();
    expect(vi.getTimerCount()).toBe(0);
    visibility.hidden = false; syncAudioVisibility();
    expect(vi.getTimerCount()).toBe(1); expect(contexts).toBe(1);
    setGameAudio(false, false); syncAudioVisibility(); expect(vi.getTimerCount()).toBe(0);
  });
  it('remains usable if Web Audio is unavailable', async () => {
    vi.stubGlobal('AudioContext', class { constructor() { throw new Error('unsupported'); } });
    const { setGameAudio, playTone } = await import('../lib/audio');
    expect(() => { setGameAudio(true, true); playTone(true); }).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });
});
