import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {ScatterplotLayer, PolygonLayer} from 'deck.gl';

// Set your mapbox token here
const MALE_COLOR = [0, 128, 255];
const FEMALE_COLOR = [255, 0, 128];

// Source data CSV
const SCATTERPLOT_DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json'; // eslint-disable-line

export const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.7,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

export class App extends Component {
  _renderLayers() {
    const {
      scatterplot_data = SCATTERPLOT_DATA_URL,
      radius = 30,
      maleColor = MALE_COLOR,
      femaleColor = FEMALE_COLOR
    } = this.props;

    const polygon_data = [ { contour: [[-74, 40.7], [-74.01, 40.7], [-74.01, 40.71], [-74, 40.71]] } ];

    return [
      new PolygonLayer({
        id: 'polygon-layer',
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
