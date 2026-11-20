/**
 * Fallback allocation budget for browsers that do not expose a heap size limit.
 * Matches the long-standing ceiling used by canLoadResolution in spatial-utils.
 */
export const DEFAULT_MAX_ALLOCATION_BYTES = (2 ** 31) - 1;

type PerformanceWithMemory = {
  memory?: { jsHeapSizeLimit?: unknown },
};

/**
 * The JS heap size limit reported by the browser, when available.
 * Only Chromium exposes performance.memory; Firefox, Safari, Node, and
 * workers return null. Read via globalThis so this is safe outside the DOM.
 * @returns The limit in bytes, or null when unknown.
 */
export function getJsHeapSizeLimit(): number | null {
  const perf = (globalThis as { performance?: PerformanceWithMemory }).performance;
  const limit = perf?.memory?.jsHeapSizeLimit;
  if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
    return limit;
  }
  return null;
}

/**
 * How many bytes a single large allocation may plausibly take.
 * Half of the reported heap limit, else DEFAULT_MAX_ALLOCATION_BYTES.
 * @returns The budget in bytes.
 */
export function getAllocationBudgetBytes(): number {
  const limit = getJsHeapSizeLimit();
  return limit === null ? DEFAULT_MAX_ALLOCATION_BYTES : limit / 2;
}

/**
 * Whether an allocation of the given size exceeds the budget.
 * Non-finite sizes (overflowed products, NaN) count as exceeding it.
 * @param bytes The estimated allocation size in bytes.
 * @returns True when the allocation should not be attempted blindly.
 */
export function exceedsAllocationBudget(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes > getAllocationBudgetBytes();
}
