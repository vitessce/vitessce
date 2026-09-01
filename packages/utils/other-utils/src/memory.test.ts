import { describe, it, expect, afterEach } from 'vitest';
import {
  DEFAULT_MAX_ALLOCATION_BYTES,
  getJsHeapSizeLimit,
  getAllocationBudgetBytes,
  exceedsAllocationBudget,
} from './memory.js';
import { formatBytes } from './components.js';

function setHeapLimit(value: unknown) {
  Object.defineProperty(globalThis.performance, 'memory', {
    value: { jsHeapSizeLimit: value },
    configurable: true,
  });
}

describe('allocation budget', () => {
  afterEach(() => {
    delete (globalThis.performance as { memory?: unknown }).memory;
  });

  it('falls back when the browser reports no heap limit', () => {
    // Node and jsdom, like Firefox and Safari, have no performance.memory.
    expect(getJsHeapSizeLimit()).toEqual(null);
    expect(getAllocationBudgetBytes()).toEqual(DEFAULT_MAX_ALLOCATION_BYTES);
    expect(exceedsAllocationBudget(DEFAULT_MAX_ALLOCATION_BYTES)).toEqual(false);
    expect(exceedsAllocationBudget(DEFAULT_MAX_ALLOCATION_BYTES + 1)).toEqual(true);
  });

  it('uses half of the reported heap limit', () => {
    setHeapLimit(1000);
    expect(getJsHeapSizeLimit()).toEqual(1000);
    expect(getAllocationBudgetBytes()).toEqual(500);
    expect(exceedsAllocationBudget(500)).toEqual(false);
    expect(exceedsAllocationBudget(501)).toEqual(true);
  });

  it('ignores malformed heap limits', () => {
    setHeapLimit('4096');
    expect(getJsHeapSizeLimit()).toEqual(null);
    setHeapLimit(0);
    expect(getJsHeapSizeLimit()).toEqual(null);
  });

  it('treats non-finite sizes as exceeding the budget', () => {
    expect(exceedsAllocationBudget(Number.NaN)).toEqual(true);
    expect(exceedsAllocationBudget(Number.POSITIVE_INFINITY)).toEqual(true);
  });
});

describe('formatBytes', () => {
  it('formats sizes beyond gigabytes', () => {
    expect(formatBytes(2 ** 40)).toEqual('1 TB');
    expect(formatBytes(465 * (2 ** 30))).toEqual('465 GB');
    expect(formatBytes(3 * (2 ** 50))).toEqual('3 PB');
  });
});
