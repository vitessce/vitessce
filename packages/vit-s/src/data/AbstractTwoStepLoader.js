import AbstractLoader from './AbstractLoader.js';

export default class AbstractTwoStepLoader extends AbstractLoader {
  constructor(dataSource, params) {
    super(params);
    this.dataSource = dataSource;
  }
}
