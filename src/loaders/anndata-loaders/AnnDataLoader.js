import AbstractTwoStepLoader from '../AbstractTwoStepLoader';

export default class AnnDataLoader extends AbstractTwoStepLoader {
  loadCellNames() {
    return this.dataSource.loadObsIndex();
  }

  loadGeneNames() {
    return this.dataSource.loadVarIndex();
  }
}
