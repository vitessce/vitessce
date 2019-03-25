import React from 'react';
import PubSub from 'pubsub-js';
import shortNumber from 'short-number';

import { BLACK_CARD, TITLE_CARD } from '../classNames';
import {
  IMAGES_ADD, MOLECULES_ADD, NEIGHBORHOODS_ADD, CELLS_ADD, CELLS_COLOR,
  STATUS_INFO, CELLS_SELECTION, CLEAR_PLEASE_WAIT,
} from '../../events';
import Spatial from './Spatial';

function clearPleaseWait(layerName) {
  PubSub.publish(CLEAR_PLEASE_WAIT, layerName);
}

export default class SpatialSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: undefined,
      cells: {},
      selectedCellIds: {},
      cellColors: null,
    };
  }

  componentWillMount() {
    this.imagesAddToken = PubSub.subscribe(
      IMAGES_ADD, this.imagesAddSubscriber.bind(this),
    );
    this.moleculesAddToken = PubSub.subscribe(
      MOLECULES_ADD, this.moleculesAddSubscriber.bind(this),
    );
    this.neighborhoodsAddToken = PubSub.subscribe(
      NEIGHBORHOODS_ADD, this.neighborhoodsAddSubscriber.bind(this),
    );
    this.cellsAddToken = PubSub.subscribe(
      CELLS_ADD, this.cellsAddSubscriber.bind(this),
    );
    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
    this.cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, this.cellsColorSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.imagesAddToken);
    PubSub.unsubscribe(this.moleculesAddToken);
    PubSub.unsubscribe(this.neighborhoodsAddToken);
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.cellsColorToken);
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  imagesAddSubscriber(msg, images) {
    this.setState({ images });
  }

  moleculesAddSubscriber(msg, molecules) {
    this.setState({ molecules });
  }

  neighborhoodsAddSubscriber(msg, neighborhoods) {
    this.setState({ neighborhoods });
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({ cells });
  }

  cellsColorSubscriber(msg, cellColors) {
    this.setState({ cellColors });
  }

  render() {
    const { cells, molecules } = this.state;
    const cellsCount = cells ? Object.keys(cells).length : 0;
    const moleculesCount = molecules ? Object.keys(molecules).length : 0;
    const locationsCount = molecules
      ? Object.values(molecules).map(l => l.length).reduce((a, b) => a + b, 0) : 0;
    return (
      /* eslint-disable react/destructuring-assignment */
      <React.Fragment>
        <div className={TITLE_CARD}>
          Spatial
          ({cellsCount} cells, {moleculesCount} molecules
          at {shortNumber(locationsCount)} locations)
        </div>
        <div className={BLACK_CARD}>
          <Spatial
            {... this.state}
            updateStatus={
              message => PubSub.publish(STATUS_INFO, message)
            }
            updateCellsSelection={
              selectedCellIds => PubSub.publish(CELLS_SELECTION, selectedCellIds)
            }
            clearPleaseWait={clearPleaseWait}
          />
        </div>
      </React.Fragment>
      /* eslint-enable */
    );
  }
}
