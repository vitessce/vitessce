/* eslint-disable no-plusplus */
import AbstractLoader from './AbstractLoader';
import LoaderResult from './LoaderResult';

export default class RosslerAttractorLoader extends AbstractLoader {
  // eslint-disable-next-line class-methods-use-this
  load() {
    const N = 5e5;

    const cells = {};
    let xn = 2.644838333129883;
    let yn = 4.060488700866699;
    let zn = 2.8982460498809814;
    let xn1;
    let yn1;
    let zn1;
    const a = 0.2;
    const b = 0.2;
    const c = 5.7;
    const dt = 0.006;

    for (let i = 0; i <= N; i++) {
      let dx = -yn - zn;
      let dy = xn + a * yn;
      let dz = b + zn * (xn - c);

      const xh = xn + 0.5 * dt * dx;
      const yh = yn + 0.5 * dt * dy;
      const zh = zn + 0.5 * dt * dz;

      dx = -yh - zh;
      dy = xh + a * yh;
      dz = b + zh * (xh - c);

      xn1 = xn + dt * dx;
      yn1 = yn + dt * dy;
      zn1 = zn + dt * dz;

      cells[`cell_${i}`] = {
        mappings: {
          rossler: [xn1, yn1],
        },
      };

      xn = xn1;
      yn = yn1;
      zn = zn1;
    }

    return Promise.resolve(new LoaderResult(cells, null));
  }
}
