import { useMemo, useState, useEffect, useReducer, useRef } from 'react';
import uuidv4 from 'uuid/v4';
import { getDefaultColor } from '@vitessce/utils';
import SpatialWorkerPool from './SpatialWorkerPool';

export function useCellColors(params) {
  const {
    cellSets,
    cellSetSelection,
    cellSetColor,
    theme,
  } = params;

  const workerPool = useMemo(() => new SpatialWorkerPool(), []);

  const buffer = useMemo(() => new ArrayBuffer(2048 * 2048 * 3), []);
  const dataRef = useRef();
  const cellColorsRef = useRef();

  // Since we are storing the tile data in a ref,
  // and updating it asynchronously when the worker finishes,
  // we need to tie it to a piece of state through this iteration value.
  const [resultIteration, incResultIteration] = useReducer(i => i + 1, 0);

  // We need to keep a backlog of the tasks for the worker thread,
  // since the array buffer can only be held by one thread at a time.
  const [backlog, setBacklog] = useState([]);

  // If any of the input data variables have changed,
  // then new tiles need to be generated,
  // so add a new task to the backlog.
  useEffect(() => {
    // Use a uuid to give the task a unique ID,
    // to help identify where in the list it is located
    // after the worker thread asynchronously sends the data back
    // to this thread.
    if (
      buffer && cellSets && cellSetSelection && cellSetColor && theme
    ) {
      setBacklog(prev => [...prev, uuidv4()]);
    }
  }, [buffer && cellSets, cellSetSelection, cellSetColor, theme]);

  // When the backlog has updated, a new worker job can be submitted if:
  // - the backlog has length >= 1 (at least one job is waiting), and
  // - buffer.byteLength is not zero, so the worker does not currently "own" the buffer.
  useEffect(() => {
    if (backlog.length < 1) {
      return;
    }
    const curr = backlog[backlog.length - 1];
    if (buffer && buffer.byteLength > 0 && cellSets && cellSetSelection && cellSetColor && theme) {
      const promise = workerPool.process({
        curr,
        cellSets,
        cellSetSelection,
        cellSetColor,
        defaultColor: getDefaultColor(theme),
        data: buffer.slice(),
      });
      const process = async () => {
        const result = await promise;
        dataRef.current = new Uint8Array(result.buffer);
        cellColorsRef.current = result.cellColors;
        incResultIteration();
        const { curr: currWork } = result;
        setBacklog((prev) => {
          const currIndex = prev.indexOf(currWork);
          return prev.slice(currIndex + 1, prev.length);
        });
      };
      process();
    }
  }, [buffer, backlog, workerPool, dataRef]);

  // Get the result after resultIteration has changed
  // to indicate a updated results.
  const [cellColors, uint8Colors] = useMemo(() => {
    if (!dataRef.current || backlog.length) {
      return [new Map(), null];
    }
    return [cellColorsRef.current, dataRef.current];
  }, [resultIteration, backlog.length]);

  return [cellColors, uint8Colors, resultIteration];
}
