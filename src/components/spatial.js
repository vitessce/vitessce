import React from 'react';
import DeckGL, {ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM, OrthographicView}
  from 'deck.gl';
import {Matrix4} from 'math.gl';
import {BitmapLayer} from '@deck.gl/experimental-layers';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';
import { IMAGE_ADD } from '../events';

// Set your mapbox token here
const MALE_COLOR = [0, 128, 255];
const FEMALE_COLOR = [255, 0, 128];

export const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 1,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
  offset: [0, 0] // Required: https://github.com/uber/deck.gl/issues/2580
};

export class SpatialSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {baseImgUrl: undefined};
  }

  componentWillMount() {
    this.imageToken = PubSub.subscribe(IMAGE_ADD, this.imageAddSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.imageToken);
  }

  imageAddSubscriber(msg, baseImg) {
    this.setState({baseImg: baseImg});
  }

  render() {
    return (
      <Spatial baseImg={this.state.baseImg}/>
    );
  }
}

function renderLayers(props) {
  const {
    scatterplot_data = [[-74, 57, 1], [-65, 41, 2], [-73, 32, 1], [-74, 40, 2]],
    radius = 5,
    maleColor = MALE_COLOR,
    femaleColor = FEMALE_COLOR,
    baseImg = undefined
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
  layers.push(
    new ScatterplotLayer({
      id: 'scatter-plot',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: scatterplot_data,
      radiusScale: radius,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => (d[2] === 1 ? maleColor : femaleColor),
      getRadius: 1,
      updateTriggers: {
        getColor: [maleColor, femaleColor]
      }
    })
  );
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
