import React from 'react';
import PubSub from 'pubsub-js';
import { IMAGE_ADD, MOLECULES_ADD, CELLS_ADD, STATUS_INFO, CELLS_SELECTION } from '../../events';
import Spatial from './Spatial';


export class SpatialSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {baseImgUrl: undefined};
  }

  componentWillMount() {
    this.imageToken = PubSub.subscribe(IMAGE_ADD, this.imageAddSubscriber.bind(this));
    this.moleculesToken = PubSub.subscribe(MOLECULES_ADD, this.moleculesAddSubscriber.bind(this));
    this.cellsAddToken = PubSub.subscribe(CELLS_ADD, this.cellsAddSubscriber.bind(this));
    this.cellsSelectionToken = PubSub.subscribe(CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.imageToken);
    PubSub.unsubscribe(this.moleculesToken);
    PubSub.unsubscribe(this.this.cellsAddToken);
    PubSub.unsubscribe(this.this.cellsSelectionToken);
  }

  imageAddSubscriber(msg, baseImg) {
    this.setState({baseImg: baseImg});
  }

  moleculesAddSubscriber(msg, molecules) {
    this.setState({molecules: molecules});
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({cells: cells});
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({selectedCellIds: cellIds});
  }

  render() {
    return (
      <Spatial
        baseImg={this.state.baseImg}
        molecules={this.state.molecules}
        cells={this.state.cells}
        updateStatus={(message) => PubSub.publish(STATUS_INFO, message)}
        updateCellsSelection={(selectedCellIds) => PubSub.publish(CELLS_SELECTION, selectedCellIds)}
      />
    );
  }
}
