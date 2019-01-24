import React from 'react';
import DeckGL, {ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM, OrthographicView}
  from 'deck.gl';
import {Matrix4} from 'math.gl';
import {BitmapLayer} from '@deck.gl/experimental-layers';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';
import { IMAGE_ADD, MOLECULES_ADD } from '../events';

export const INITIAL_VIEW_STATE = {
  zoom: 2, // TODO: zoom=3 or above does not work?
  maxZoom: 40, // This is enough for the Linnarson lab data, but should be derived?
  pitch: 0,
  bearing: 0,
  offset: [10000, 10000] // Required: https://github.com/uber/deck.gl/issues/2580
};

export class SpatialSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {baseImgUrl: undefined};
  }

  componentWillMount() {
    this.imageToken = PubSub.subscribe(IMAGE_ADD, this.imageAddSubscriber.bind(this));
    this.moleculesToken = PubSub.subscribe(MOLECULES_ADD, this.moleculesAddSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.imageToken);
    PubSub.unsubscribe(this.moleculesToken);
  }

  imageAddSubscriber(msg, baseImg) {
    this.setState({baseImg: baseImg});
  }

  moleculesAddSubscriber(msg, molecules) {
    this.setState({molecules: molecules});
  }

  render() {
    return (
      <Spatial baseImg={this.state.baseImg} molecules={this.state.molecules}/>
    );
  }
}

function renderLayers(props) {
  const {
    baseImg = undefined,
    molecules = undefined
  } = props;

  const polygon_data = [ { contour: [[-20, -20], [-65, -10], [-80, 0], [-70, 40]] } ];

  var layers = [];

  if (baseImg) {
    const scale = [baseImg.width, baseImg.height, 1];
    layers.push(
      new BitmapLayer({
        id: 'bitmap-layer',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        images: [baseImg.url],
        data: [{
          imageUrl: baseImg.url,
          center: [0, 0, 0],
          rotation: 0
        }],
        opacity: 1,
        // By default, loads as a 1x1 image.
        modelMatrix: new Matrix4().scale(scale)
      })
    );
  }

  layers.push(
    new PolygonLayer({
      id: 'polygon-layer',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: polygon_data,
      pickable: true,
      stroked: true,
      filled: true,
      wireframe: true,
      lineWidthMinPixels: 1,
      getPolygon: d => d.contour,
      getElevation: d => 0,
      getFillColor: d => [255, 0, 0],
      getLineColor: [80, 80, 80],
      getLineWidth: 1,
      onHover: ({object, x, y}) => {
        //const tooltip = `${object.zipcode}\nPopulation: ${object.population}`;
        /* Update tooltip
           http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
        */
      }
    })
  );

  if (molecules) {
    var scatterplot_data = [];
    for (const [molecule, coords] of Object.entries(molecules)) {
      console.warn('TODO: Use molecule in scatterplot_data: ' + molecule);
      scatterplot_data = scatterplot_data.concat(coords);
    }
    layers.push(
      new ScatterplotLayer({
        id: 'scatter-plot',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: scatterplot_data,
        // TODO: How do the other radius attributes work?
        // If it were possible to have dots that remained the same size,
        // regardless of zoom, would we prefer that?
        getRadius: 6,
        getPosition: d => [d[0], d[1], 0],
        getColor: d => [0, 128, 255],
      })
    );
  }
  return layers;
}

export function Spatial(props) {
  const {viewState, controller = true} = props;

  return (
    <DeckGL
      views={[new OrthographicView()]}
      layers={renderLayers(props)}
      initialViewState={INITIAL_VIEW_STATE}
      viewState={viewState}
      controller={controller}
    >
    </DeckGL>
  );
}

Spatial.propTypes = {
  viewState: PropTypes.object,
  controller: PropTypes.bool
}
