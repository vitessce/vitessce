import React from 'react';
import PubSub from 'pubsub-js';
import {
  IMAGES_ADD, MOLECULES_ADD, CELLS_ADD, STATUS_INFO,
  CELLS_SELECTION, SELECTION_MODE_SET,
} from '../../events';
import Spatial from './Spatial';
import AbstractSelectionSubscriberComponent from '../AbstractSelectionSubscriberComponent';


export default class SpatialSubscriber extends AbstractSelectionSubscriberComponent {
  constructor(props) {
    super(props);
    this.state = {
      background: undefined, cells: {}, selectedCellIds: {}, isRectangleSelection: false,
    };
  }

  componentWillMount() {
    this.imageAddToken = PubSub.subscribe(
      IMAGES_ADD, this.imageAddSubscriber.bind(this),
    );
    this.moleculesAddToken = PubSub.subscribe(
      MOLECULES_ADD, this.moleculesAddSubscriber.bind(this),
    );
    this.cellsAddToken = PubSub.subscribe(
      CELLS_ADD, this.cellsAddSubscriber.bind(this),
    );

    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
    this.selectionModeSetToken = PubSub.subscribe(
      SELECTION_MODE_SET, this.selectionModeSetSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.imageAddToken);
    PubSub.unsubscribe(this.moleculesAddToken);
    PubSub.unsubscribe(this.cellsAddToken);

    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.selectionModeSetToken);
  }

  imageAddSubscriber(msg, background) {
    this.setState({ background });
  }

  moleculesAddSubscriber(msg, molecules) {
    this.setState({ molecules });
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({ cells });
  }

  render() {
    return (
      <Spatial
        background={this.state.background}
        molecules={this.state.molecules}
        cells={this.state.cells}
        selectedCellIds={this.state.selectedCellIds}
        isRectangleSelection={this.state.isRectangleSelection}
        updateStatus={message => PubSub.publish(STATUS_INFO, message)}
        updateCellsSelection={selectedCellIds => PubSub.publish(CELLS_SELECTION, selectedCellIds)}
      />
    );
  }
}
