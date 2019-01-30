import React from 'react';
import DeckGL, {ScatterplotLayer, COORDINATE_SYSTEM, OrthographicView}
  from 'deck.gl';

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
    cells = undefined
  } = props;

  var layers = [];

  if (cells) {
    var scatterplotData = [];
    var clusterColors = {};
    for (const cell of Object.values(cells)) {
      scatterplotData.push([cell.tsne[0], cell.tsne[1], cell.cluster]);
      if (! clusterColors[cell.cluster]) {
        clusterColors[cell.cluster] = PALETTE[Object.keys(clusterColors).length % PALETTE.length]
      }
    }
    layers.push(
      new ScatterplotLayer({
        id: 'tsne-scatter-plot',
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        data: scatterplotData,
        getRadius: 0.5,
        getPosition: d => [d[0], d[1], 0],
        getColor: d => clusterColors[d[2]]
      })
    );
  }

  return layers;
}

const INITIAL_VIEW_STATE = {
  zoom: 2,
  offset: [0, 0] // Required: https://github.com/uber/deck.gl/issues/2580
};

export default function Tsne(props) {

  // The real business logic goes inside.
  return (
    <DeckGL
      views={[new OrthographicView()]}
      layers={renderLayers(props)}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      //onViewStateChange={({viewState}) => {console.log(viewState)}}
    >
    </DeckGL>
  );
}
