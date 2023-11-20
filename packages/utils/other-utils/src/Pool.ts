// https://developer.mozilla.org/en-US/docs/Web/API/NavigatorConcurrentHardware/hardwareConcurrency
// We need to give a different way of getting this for safari, so 4 is probably a safe bet
// for parallel processing in the meantime.  More can't really hurt since they'll just block
// each other and not the UI thread, which is the real benefit.
const defaultPoolSize = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 1;

/**
 * Pool for workers to decode chunks of the images.
 * This is a line-for-line copy of GeoTIFFs old implementation: https://github.com/geotiffjs/geotiff.js/blob/v1.0.0-beta.6/src/pool.js
 */
export default class Pool {
  workers: Worker[];

  idleWorkers: Worker[];

  waitQueue: { resolve?: (worker: Worker) => void }[];

  /**
   * @constructor
   * @param {object} Worker The worker class to be used for processing.
   */
  constructor(createWorker: () => Worker) {
    this.workers = [];
    this.idleWorkers = [];
    this.waitQueue = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < defaultPoolSize; ++i) {
      const w = createWorker();
      this.workers.push(w);
      this.idleWorkers.push(w);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async process() {
    throw new Error('Pool needs to implement "process" method');
  }

  async waitForWorker() {
    const idleWorker = this.idleWorkers.pop();
    if (idleWorker) {
      return idleWorker;
    }
    const waiter: { resolve?: (worker: Worker) => void } = {};
    const promise = new Promise((resolve) => {
      waiter.resolve = resolve;
    });

    this.waitQueue.push(waiter);
    return promise;
  }

  async finishTask(currentWorker: Worker) {
    const waiter = this.waitQueue.pop();
    if (waiter && waiter.resolve) {
      waiter.resolve(currentWorker);
    } else {
      this.idleWorkers.push(currentWorker);
    }
  }

  destroy() {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < this.workers.length; ++i) {
      this.workers[i].terminate();
    }
  }
}
