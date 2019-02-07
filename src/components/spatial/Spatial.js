import React from 'react';
import DeckGL, {ScatterplotLayer, COORDINATE_SYSTEM, OrthographicView}
  from 'deck.gl';
import {SelectablePolygonLayer} from '../../layers/'
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

function renderLayers(props, selectedCellIds) {
  const {
    // baseImg = undefined,
    molecules = undefined,
    cells = undefined,
    updateStatus = (message) => { console.warn(`Spatial updateStatus: ${message}`)},
  } = props;

  var layers = [];

  // if (baseImg) {
  //   const multiplier = 200; // TODO: derive from filename?
  //   const scale = [baseImg.width * multiplier, baseImg.height * multiplier, 1];
  //   layers.push(
  //     new BitmapLayer({
  //       id: 'bitmap-layer',
  //       coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  //       images: [baseImg.url],
  //       data: [{
  //         imageUrl: baseImg.url,
  //         center: [0, 0, 0],
  //         rotation: 0
  //       }],
  //       opacity: 1,
  //       // By default, loads as a 1x1 image.
  //       modelMatrix: new Matrix4().scale(scale)
  //     })
  //   );
  // }

  if (cells) {
    var clusterColors = {};
    for (const cell of Object.values(cells)) {
      if (! clusterColors[cell.cluster]) {
        clusterColors[cell.cluster] = PALETTE[Object.keys(clusterColors).length % PALETTE.length]
      }
    }
    layers.push(
      new SelectablePolygonLayer({
        id: 'polygon-layer',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: Object.entries(cells),
        isSelected: cellEntry => selectedCellIds.includes(cellEntry[0]),
        pickable: true,
        autoHighlight: true,
        stroked: true,
        filled: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: function(cellEntry) {
          const cell = cellEntry[1]
          return cell.poly ? cell.poly : square(cell.xy[0], cell.xy[1]);
        },
        getElevation: 0,
        getFillColor: cellEntry => clusterColors[cellEntry[1].cluster],
        getLineColor: [80, 80, 80],
        getLineWidth: 1,
        onHover: info => {
          if (info.object) { updateStatus(`Cluster: ${info.object[1].cluster}`) }
        },
        onClick: info => { console.log('TODO: Toggle selection'); },
        //onClick: info => console.log('Clicked:', info)
      })
    );
  }

  if (molecules) {
    var scatterplotData = [];
    var index = 0;
    for (const [molecule, coords] of Object.entries(molecules)) {
      scatterplotData = scatterplotData.concat(
        coords.map(([x,y]) => [x,y,index,molecule]) // eslint-disable-line no-loop-func
        // TODO: Using an object would be more clear, but is there a performance penalty,
        // either in time or memory?
      );
      index++;
    }
    layers.push(
      new ScatterplotLayer({
        id: 'scatter-plot',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: scatterplotData,
        pickable: true,
        autoHighlight: true,
        // TODO: How do the other radius attributes work?
        // If it were possible to have dots that remained the same size,
        // regardless of zoom, would we prefer that?
        getRadius: 10,
        getPosition: d => [d[0], d[1], 0],
        getColor: d => PALETTE[d[2] % PALETTE.length],
        onHover: info => {
          if (info.object) { updateStatus(`Gene: ${info.object[3]}`) }
        }
      })
    );
  }
  return layers;
}

const INITIAL_VIEW_STATE = {
  zoom: -5,
  offset: [460, 640] // Required: https://github.com/uber/deck.gl/issues/2580
};

// function viewState(props) {
//   const {
//     molecules = undefined
//   } = props;
//
//   if (!molecules) {
//     // TODO: also sniff cells
//     console.log('abort');
//     return INITIAL_VIEW_STATE;
//   }
//
//   var {...state} = INITIAL_VIEW_STATE;
//   var [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
//   if (molecules) {
//     for (const coords of Object.values(molecules)) {
//       for (const coord of coords) {
//         if (coord[0] < minX) { minX = coord[0] }
//         if (coord[0] > maxX) { maxX = coord[0] }
//         if (coord[1] < minY) { minY = coord[1] }
//         if (coord[1] > maxY) { maxY = coord[1] }
//       }
//     }
//     const x = (maxX + minX) / 2;
//     const y = (maxY + minY) / 2;
//     state.offset = [x, y];
//   }
//
//   console.log(state);
//   return state;
// }



export default class Spatial extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selectedCellIds: [
      '4000', '4001', '4002', '4003', '4004',
      '4010', '4011', '4012', '4013', '4014',
      '4020', '4021', '4032', '4043', '4044',
      '4050', '4051', '4052', '4053', '4054'
    ]};
  }

  render() {
    return (
      <DeckGL
        views={[new OrthographicView()]}
        layers={renderLayers(this.props, this.state.selectedCellIds)}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        //onViewStateChange={({viewState}) => {console.log(viewState)}}
      />
    );
  }
}


// Spatial.propTypes = {
//   viewState: PropTypes.object,
//   controller: PropTypes.bool
// }
