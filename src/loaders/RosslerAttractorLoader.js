/* eslint-disable */
import AbstractLoader from './AbstractLoader';
import { LoaderFetchError, LoaderValidationError, AbstractLoaderError } from './errors/index';
import LoaderResult from './LoaderResult';

export default class RosslerAttractorLoader extends AbstractLoader {

  load() {
    const {
      url, requestInit, type, fileType,
    } = this;
    
    const N = 1e6;

    const cells = {};
    let xn = 2.644838333129883,
      yn = 4.060488700866699,
      zn = 2.8982460498809814;
    let xn1, yn1, zn1;
    let a = 0.2;
    let b = 0.2;
    let c = 5.7;
    let dt = 0.006;
    for (var i = 0; i <= N; i++) {
      let dx = -yn - zn;
      let dy = xn + a * yn;
      let dz = b + zn * (xn - c);

      let xh = xn + 0.5 * dt * dx;
      let yh = yn + 0.5 * dt * dy;
      let zh = zn + 0.5 * dt * dz;

      dx = -yh - zh;
      dy = xh + a * yh;
      dz = b + zh * (xh - c);

      let xn1 = xn + dt * dx;
      let yn1 = yn + dt * dy;
      let zn1 = zn + dt * dz;

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
