import { log } from '@vitessce/globals';
import { MatrixTooLargeError } from '@vitessce/error';
import {
  exceedsAllocationBudget,
  getAllocationBudgetBytes,
  formatBytes,
} from '@vitessce/utils';

const TOO_LARGE_DOCS_URL = 'https://vitessce.io/docs/data-troubleshooting/#my-obsfeaturematrix-is-too-large-to-render-everything';

const describeBytes = bytes => (
  Number.isFinite(bytes) ? formatBytes(bytes) : 'more memory than can be addressed'
);

/**
 * Run a dense observation-by-feature allocation with a size warning and a
 * descriptive failure. When the estimate exceeds the browser's allocation
 * budget a warning is logged and the allocation is still attempted; if the
 * allocation then fails, the RangeError is converted into a MatrixTooLargeError
 * that names the matrix, instead of surfacing far from its cause.
 * @param {object} params
 * @param {string} params.source Where the matrix comes from, e.g. a quoted URL
 * or path (without credentials).
 * @param {number[]} params.shape [numObservations, numFeatures].
 * @param {number} [params.bytesPerElement=4] Bytes per matrix element.
 * @param {Function} params.allocate Performs the allocation, or work (such as a
 * read) that allocates internally. May return a promise.
 * @returns {*} Whatever allocate returns: a value for synchronous callers, a
 * promise for asynchronous ones.
 */
export function allocateDenseMatrix({
  source, shape, bytesPerElement = 4, allocate,
}) {
  const bytes = shape[0] * shape[1] * bytesPerElement;
  const message = `Loading the full observation-by-feature matrix from ${source} (shape [${shape.join(', ')}]) needs about ${describeBytes(bytes)} of memory, more than this browser's ~${formatBytes(getAllocationBudgetBytes())} budget. Consider pointing at a smaller matrix or filtering features. See ${TOO_LARGE_DOCS_URL}`;
  if (exceedsAllocationBudget(bytes)) {
    // Attempt anyway: the budget is a heuristic, and a failed allocation is
    // reported descriptively below.
    log.warn(message);
  }
  // Checked by name as well as by class: the error may come from another realm.
  const toError = e => (
    (e instanceof RangeError || e?.name === 'RangeError')
      ? new MatrixTooLargeError(`${message} (${e.message})`)
      : e
  );
  try {
    const result = allocate();
    if (result && typeof result.then === 'function') {
      return result.catch((e) => { throw toError(e); });
    }
    return result;
  } catch (e) {
    throw toError(e);
  }
}
