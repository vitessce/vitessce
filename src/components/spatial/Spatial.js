import React from 'react';
import DeckGL, {ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM, OrthographicView}
  from 'deck.gl';
import {Matrix4} from 'math.gl';
import {BitmapLayer} from '@deck.gl/experimental-layers';
import PropTypes from 'prop-types';

function square(x, y) {
  return [[x, y+100], [x+100, y], [x, y-100], [x-100, y]]
}

// TODO: Dynamic palette generation? Or set by user?
// from http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=12#type=qualitative&scheme=Paired&n=12
const PALETTE = [
  [166,206,227],
  [31,120,180],
  [178,223,138],
  [51,160,44],
  [251,154,153],
  [227,26,28],
  [253,191,111],
  [255,127,0],
  [202,178,214],
  [106,61,154],
  [255,255,153],
  [177,89,40]
];


function renderLayers(props) {
  const {
    baseImg = undefined,
    molecules = undefined,
    cells = undefined
  } = props;

  var layers = [];

  if (baseImg) {
    const multiplier = 200; // TODO: derive from filename?
    const scale = [baseImg.width * multiplier, baseImg.height * multiplier, 1];
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

  if (cells) {
    var clusterColors = {};
    for (const cell of Object.values(cells)) {
      if (! clusterColors[cell.cluster]) {
        clusterColors[cell.cluster] = PALETTE[Object.keys(clusterColors).length % PALETTE.length]
      }
    }
    layers.push(
      new PolygonLayer({
        id: 'polygon-layer',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: Object.entries(cells),
        pickable: true,
        onHover: info => console.log('Cell Hovered:', info),
        onClick: info => console.log('Cell Clicked:', info),
        stroked: true,
        filled: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: function(cellEntry) {
          const cell = cellEntry[1]
          return cell.poly
            ? cell.poly // TODO: every cell should have a poly!
            : square(cell.xy[0], cell.xy[1]);
        },
        getElevation: 0,
        getFillColor: cellEntry => clusterColors[cellEntry[1].cluster],
        getLineColor: [80, 80, 80],
        getLineWidth: 1,
        // onHover: ({object, x, y}) => {
        //   //const tooltip = `${object.zipcode}\nPopulation: ${object.population}`;
        //   /* Update tooltip
        //      http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
        //   */
        // }
      })
    );
  }

  if (molecules) {
    var scatterplot_data = [];
    var index = 0;
    for (const [molecule, coords] of Object.entries(molecules)) {
      console.warn('TODO: Use molecule in scatterplot_data: ' + molecule);
      scatterplot_data = scatterplot_data.concat(
        coords.map(([x,y]) => [x,y,index]) // eslint-disable-line no-loop-func
      );
      index++;
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
        getColor: d => PALETTE[d[2] % PALETTE.length]
      })
    );
  }
  return layers;
}

export default function Spatial(props) {
  const {viewState, controller = true} = props;

  const INITIAL_VIEW_STATE = {
    zoom: 2, // TODO: zoom=3 or above does not work?
    maxZoom: 40, // TODO: derive from user data
    pitch: 0,
    bearing: 0,
    offset: [10000, 10000] // Required: https://github.com/uber/deck.gl/issues/2580
    // TODO: derive from user data
  };

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
