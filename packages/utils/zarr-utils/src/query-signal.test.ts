import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { fetchQueryWithSignal, type QueryClientLike } from './query-signal.js';

// A query function whose result resolves only when released,
// and which records the signal it received.
function makeGatedQueryFn(value: string) {
  const signals: AbortSignal[] = [];
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const queryFn = async (ctx?: { signal?: AbortSignal }) => {
    if (ctx?.signal) {
      signals.push(ctx.signal);
    }
    await gate;
    return value;
  };
  return { queryFn, signals, release: () => release() };
}

function getQueryClient() {
  return new QueryClient() as unknown as QueryClientLike;
}

describe('fetchQueryWithSignal', () => {
  it('resolves with the query data when no signal is provided', async () => {
    const queryClient = getQueryClient();
    const { queryFn, release } = makeGatedQueryFn('a');
    const promise = fetchQueryWithSignal(queryClient, { queryKey: ['a'], queryFn });
    release();
    expect(await promise).toEqual('a');
  });

  it('rejects without fetching when the signal is already aborted', async () => {
    const queryClient = getQueryClient();
    const { queryFn, signals } = makeGatedQueryFn('a');
    const controller = new AbortController();
    controller.abort();
    await expect(
      fetchQueryWithSignal(queryClient, { queryKey: ['a'], queryFn }, controller.signal),
    ).rejects.toThrow(/abort/i);
    expect(signals.length).toEqual(0);
  });

  it('cancels the query when its only caller aborts', async () => {
    const queryClient = getQueryClient();
    const first = makeGatedQueryFn('a');
    const controller = new AbortController();
    const promise = fetchQueryWithSignal(
      queryClient, { queryKey: ['a'], queryFn: first.queryFn }, controller.signal,
    );
    controller.abort();
    await expect(promise).rejects.toThrow(/abort/i);
    expect(first.signals.length).toEqual(1);
    expect(first.signals[0].aborted).toEqual(true);

    // The cancelled query is reverted, so a subsequent call fetches again.
    const second = makeGatedQueryFn('b');
    const secondPromise = fetchQueryWithSignal(
      queryClient, { queryKey: ['a'], queryFn: second.queryFn },
    );
    second.release();
    expect(await secondPromise).toEqual('b');
  });

  it('does not cancel a query shared with a caller that has not aborted', async () => {
    const queryClient = getQueryClient();
    const { queryFn, signals, release } = makeGatedQueryFn('a');
    const controllerA = new AbortController();
    const controllerB = new AbortController();
    // Object keys in a different order still refer to the same query.
    const promiseA = fetchQueryWithSignal(
      queryClient, { queryKey: ['a', { x: 1, y: 2 }], queryFn }, controllerA.signal,
    );
    const promiseB = fetchQueryWithSignal(
      queryClient, { queryKey: ['a', { y: 2, x: 1 }], queryFn }, controllerB.signal,
    );
    controllerA.abort();
    await expect(promiseA).rejects.toThrow(/abort/i);
    expect(signals.length).toEqual(1);
    expect(signals[0].aborted).toEqual(false);
    release();
    expect(await promiseB).toEqual('a');
  });

  it('does not cancel a query shared with a caller without a signal', async () => {
    const queryClient = getQueryClient();
    const { queryFn, signals, release } = makeGatedQueryFn('a');
    const controller = new AbortController();
    const promiseA = fetchQueryWithSignal(
      queryClient, { queryKey: ['a'], queryFn }, controller.signal,
    );
    const promiseB = fetchQueryWithSignal(queryClient, { queryKey: ['a'], queryFn });
    controller.abort();
    await expect(promiseA).rejects.toThrow(/abort/i);
    expect(signals[0].aborted).toEqual(false);
    release();
    expect(await promiseB).toEqual('a');
  });

  it('cancels nested queries via the signal of the outer query function', async () => {
    const queryClient = getQueryClient();
    const inner = makeGatedQueryFn('inner');
    const controller = new AbortController();
    const promise = fetchQueryWithSignal(queryClient, {
      queryKey: ['outer'],
      queryFn: async ctx => fetchQueryWithSignal(
        queryClient, { queryKey: ['inner'], queryFn: inner.queryFn }, ctx?.signal,
      ),
    }, controller.signal);
    // Allow the outer query function to start the inner query.
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(inner.signals.length).toEqual(1);
    controller.abort();
    await expect(promise).rejects.toThrow(/abort/i);
    expect(inner.signals[0].aborted).toEqual(true);
  });
});
