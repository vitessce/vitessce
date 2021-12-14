/* eslint-disable no-underscore-dangle */
import { openArray } from 'zarr';
import AnnDataSource from './AnnDataSource';

function dirname(path) {
  const pathParts = path.split('/');
  pathParts.pop();
  return pathParts.join('/');
}

/**
 * A base MuData loader which has all shared methods for more comlpex laoders,
 * like loading cell names and ids. It inherits from AnnDataSource.
 */
export default class MuDataSource extends AnnDataSource {
  async _loadObsVariable(obs) {
    const { store } = this;
    const { categories } = await this.getJson(`${obs}/.zattrs`);
    let categoriesValues;
    if (categories) {
      const { dtype } = await this.getJson(`/${dirname(obs)}/${categories}/.zarray`);
      if (dtype === '|O') {
        categoriesValues = await this.getFlatArrDecompressed(`/${dirname(obs)}/${categories}`);
      }
    }
    const obsArr = await openArray({ store, path: obs, mode: 'r' });
    const obsValues = await obsArr.get();
    const { data } = obsValues;
    const mappedObsValues = Array.from(data).map(
      i => (!categoriesValues ? String(i) : categoriesValues[i]),
    );
    return mappedObsValues;
  }

  /**
   * Class method for loading the var index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  loadVarIndex(path = null) {
    if (this.varIndex) {
      return this.varIndex;
    }
    const varPath = `${dirname(path)}/var`;
    this.varIndex = this.getJson(`${varPath}/.zattrs`)
      .then(({ _index }) => this.getFlatArrDecompressed(`${varPath}/${_index}`));
    return this.varIndex;
  }
}
