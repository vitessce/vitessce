import {
  describe, it, expect, vi, afterEach,
} from 'vitest';
import { runSelectionWithBusySignal } from './selection-busy.js';

describe('runSelectionWithBusySignal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('runs the work inline without a busy signal', () => {
    const work = vi.fn();
    runSelectionWithBusySignal(null, work);
    expect(work).toHaveBeenCalledTimes(1);
  });

  it('signals busy, lets a frame paint, then runs the work and clears', () => {
    vi.useFakeTimers();
    const rafCallbacks = [];
    vi.stubGlobal('requestAnimationFrame', cb => rafCallbacks.push(cb));
    const calls = [];
    const onBusy = isBusy => calls.push(['busy', isBusy]);
    const work = () => calls.push(['work']);
    runSelectionWithBusySignal(onBusy, work);
    // The work is deferred until after the frame that paints the indicator.
    expect(calls).toEqual([['busy', true]]);
    rafCallbacks.forEach(cb => cb());
    expect(calls).toEqual([['busy', true]]);
    vi.runAllTimers();
    expect(calls).toEqual([['busy', true], ['work'], ['busy', false]]);
  });

  it('clears the busy signal when the work throws', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', cb => cb());
    const onBusy = vi.fn();
    expect(() => {
      runSelectionWithBusySignal(onBusy, () => { throw new Error('boom'); });
      vi.runAllTimers();
    }).toThrow('boom');
    expect(onBusy).toHaveBeenNthCalledWith(1, true);
    expect(onBusy).toHaveBeenNthCalledWith(2, false);
  });
});
