import React from 'react';
import PubSub from 'pubsub-js';
import {
  IMAGE_ADD, MOLECULES_ADD, CELLS_ADD, STATUS_INFO,
  CELLS_SELECTION, SELECTION_MODE_SET,
} from '../../events';
import Spatial from './Spatial';
import AbstractSelectionSubscriberComponent from '../AbstractSelectionSubscriberComponent';


export default class SpatialSubscriber extends AbstractSelectionSubscriberComponent {
  constructor(props) {
    super(props);
    this.state = {
      baseImgUrl: undefined, cells: {}, selectedCellIds: {}, isRectangleSelection: false,
    };
  }

  componentWillMount() {
    this.imageToken = PubSub.subscribe(
      IMAGE_ADD, this.imageAddSubscriber.bind(this),
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
    PubSub.unsubscribe(this.imageToken);

    PubSub.unsubscribe(this.moleculesAddToken);

    PubSub.unsubscribe(this.cellsAddToken);

    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.selectionModeSetToken);
  }

  imageAddSubscriber(msg, baseImg) {
    this.setState({ baseImg });
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
        background={{
          x: -500,
          y: -200,
          width: 1000,
          height: 400,
          href: 'http://gehlenborglab.org/assets/img/site/hero_backbay.jpg',
        }}
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
