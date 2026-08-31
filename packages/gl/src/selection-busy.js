/**
 * Run selection work that will block the main thread (a quadtree hit test over
 * millions of observations plus the selection-driven re-render), signaling a
 * busy indicator first and letting the browser paint it before the block
 * starts. The false signal is emitted in the same task as the work, so React
 * batches it with the state updates the work makes: the indicator disappears
 * in the same commit that shows the applied selection.
 * @param {null|((isBusy: boolean) => void)} onBusy The busy signal, or
 * null/undefined to run the work inline.
 * @param {() => void} work The blocking work.
 */
export function runSelectionWithBusySignal(onBusy, work) {
  if (typeof onBusy !== 'function' || typeof requestAnimationFrame !== 'function') {
    work();
    return;
  }
  onBusy(true);
  // requestAnimationFrame fires just before the next paint, so a timeout
  // scheduled inside it runs just after: the indicator is on screen before
  // the main thread blocks.
  requestAnimationFrame(() => setTimeout(() => {
    try {
      work();
    } finally {
      onBusy(false);
    }
  }, 0));
}
