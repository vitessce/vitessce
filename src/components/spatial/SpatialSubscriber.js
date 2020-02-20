import React from 'react';
import PubSub from 'pubsub-js';
import shortNumber from 'short-number';

import TitleInfo from '../TitleInfo';
import {
  IMAGES_ADD,
  MOLECULES_ADD,
  NEIGHBORHOODS_ADD,
  CELLS_ADD,
  CELLS_COLOR,
  STATUS_INFO,
  CELLS_SELECTION,
  CELLS_HOVER,
  CLEAR_PLEASE_WAIT,
  VIEW_INFO,
  CELL_SETS_VIEW,
  RASTER_ADD,
  SLIDERS_CHANGE,
  COLORS_CHANGE,
  CHANNEL_TOGGLE,
} from '../../events';
import Spatial from './Spatial';

export default class SpatialSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: undefined,
      cells: {},
      selectedCellIds: new Set(),
      cellColors: null,
      raster: null,
    };
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
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
    this.cellSetsViewToken = PubSub.subscribe(
      CELL_SETS_VIEW, this.cellsSelectionSubscriber.bind(this),
    );
    this.cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, this.cellsColorSubscriber.bind(this),
    );
    this.rasterAddToken = PubSub.subscribe(
      RASTER_ADD, this.rasterAddSubscriber.bind(this),
    );
    this.slidersChangeToken = PubSub.subscribe(SLIDERS_CHANGE, this.onSlidersChange.bind(this));
    this.colorsChangeToken = PubSub.subscribe(COLORS_CHANGE, this.onColorsChange.bind(this));
    this.channelToggleToken = PubSub.subscribe(CHANNEL_TOGGLE, this.onChannelToggle.bind(this));
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.imagesAddToken);
    PubSub.unsubscribe(this.moleculesAddToken);
    PubSub.unsubscribe(this.neighborhoodsAddToken);
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.cellsColorToken);
    PubSub.unsubscribe(this.cellSetsViewToken);
    PubSub.unsubscribe(this.rasterAddToken);
    PubSub.unsubscribe(this.slidersChangeToken);
    PubSub.unsubscribe(this.colorsChangeToken);
    PubSub.unsubscribe(this.channelToggleToken);
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  imagesAddSubscriber(msg, images) {
    this.setState({ images });
  }

  rasterAddSubscriber(msg, raster) {
    this.setState({ raster });
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

  onSlidersChange(msg, sliderData) {
    this.setState(prevState => ({ sliderValues: { ...prevState.sliderValues, ...sliderData } }));
  }

  onColorsChange(msg, rgbData) {
    this.setState(prevState => ({ colorValues: { ...prevState.colorValues, ...rgbData } }));
  }

  onChannelToggle(msg, channelOn) {
    this.setState(prevState => ({ channelsOn: { ...prevState.channelsOn, ...channelOn } }));
  }

  render() {
    const {
      cells, molecules, sliderValues, colorValues, channelsOn,
    } = this.state;
    const { uuid = null, children } = this.props;
    const cellsCount = cells ? Object.keys(cells).length : 0;
    const moleculesCount = molecules ? Object.keys(molecules).length : 0;
    const locationsCount = molecules
      ? Object.values(molecules).map(l => l.length).reduce((a, b) => a + b, 0) : 0;
    return (
      /* eslint-disable react/destructuring-assignment */
      <TitleInfo
        title="Spatial"
        info={`${cellsCount} cells, ${moleculesCount} molecules
              at ${shortNumber(locationsCount)} locations`}
        componentWillUnmount={this.componentWillUnmount}
      >
        {children}
        <Spatial
          {... this.state}
          view={this.props.view}
          moleculeRadius={this.props.moleculeRadius}
          cellRadius={this.props.cellRadius}
          uuid={uuid}
          updateStatus={
            message => PubSub.publish(STATUS_INFO, message)
          }
          updateCellsSelection={
            selectedCellIds => PubSub.publish(CELLS_SELECTION, selectedCellIds)
          }
          updateCellsHover={
            hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)
          }
          updateViewInfo={
            viewInfo => PubSub.publish(VIEW_INFO, viewInfo)
          }
          clearPleaseWait={
            layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
          }
          sliderValues={sliderValues}
          colorValues={colorValues}
          channelsOn={channelsOn}
        />
      </TitleInfo>
      /* eslint-enable */
    );
  }
}

SpatialSubscriber.defaultProps = {
  cellRadius: 50,
  moleculeRadius: 10,
};
