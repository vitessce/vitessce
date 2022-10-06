import AbstractLoader from './AbstractLoader';

export default class AbstractTwoStepLoader extends AbstractLoader {
  constructor(dataSource, params) {
    super(params);
    this.dataSource = dataSource;
  }
}
