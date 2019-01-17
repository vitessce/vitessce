import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM, OrthographicView}
  from 'deck.gl';
import {BitmapLayer} from '@deck.gl/experimental-layers';

// Set your mapbox token here
const MALE_COLOR = [0, 128, 255];
const FEMALE_COLOR = [255, 0, 128];

export const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: .001,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
  offset: [0, 0] // Required: https://github.com/uber/deck.gl/issues/2580
};

export class App extends Component {
  _renderLayers() {
    const {
      scatterplot_data = [[-74, 57, 1], [-65, 41, 2], [-73, 32, 1], [-74, 40, 2]],
      radius = 5,
      maleColor = MALE_COLOR,
      femaleColor = FEMALE_COLOR
    } = this.props;

    const polygon_data = [ { contour: [[0, 57], [-65, 41], [-73, 32], [-74, 40]] } ];

    const imgUrl = 'https://docs.higlass.io/_images/higlass-heatmap-screenshot.png';

    return [
      new BitmapLayer({
        id: 'bitmap-layer',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        images: [imgUrl],
        data: [{
          imageUrl: imgUrl,
          center: [0, 0, 0],
          rotation: 0,
          zoom: 100
        }]
      }),
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
      }),
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
    ];
  }

  render() {
    const {viewState, controller = true} = this.props;

    return (
      <DeckGL
        views={[new OrthographicView()]}
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
