import { open as zarrOpen, get as zarrGet } from 'zarrita';
import { AbstractTwoStepLoader, LoaderResult } from '@vitessce/vit-s';

export default class PointsZarrLoader extends AbstractTwoStepLoader {
  async loadAttrs() {
    return null;
  }

  async loadArr() {
    return null;
  }

  async loadTile(xMin, xMax, yMin, yMax) {
    const { storeRoot } = this.dataSource;
    if (this.arr) {
      return this.arr;
    }
    const zX = await zarrOpen(storeRoot.resolve('x'), { kind: 'array' });
    const zY = await zarrOpen(storeRoot.resolve('y'), { kind: 'array' });
    const zC = await zarrOpen(storeRoot.resolve('c'), { kind: 'array' });

    const selection = [slice(xMin, xMax), slice(yMin, yMax)];

    const xCoordTile = zarrGet(zX, selection);
    const yCoordTile = zarrGet(zY, selection);
    const cTile = zarrGet(zC, selection);
    console.log(xCoordTile, yCoordTile, cTile);
    return null;
  }

  load() {
    return Promise
      .all([this.loadAttrs(), this.loadArr()])
      .then(([attrs, arr]) => Promise.resolve(new LoaderResult(
        { obsIndex: attrs.data.rows, featureIndex: attrs.data.cols, obsFeatureMatrix: arr },
        null,
      )));
  }
}
