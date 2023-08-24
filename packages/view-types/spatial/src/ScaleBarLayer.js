import { CompositeLayer, COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import { LineLayer, TextLayer } from '@deck.gl/layers';

function range(len) {
  return [...Array(len).keys()];
}

function makeBoundingBox(viewState) {
  const viewport = new OrthographicView().makeViewport({
    // From the current `detail` viewState, we need its projection matrix (actually the inverse).
    viewState,
    height: viewState.height,
    width: viewState.width
  });
  // Use the inverse of the projection matrix to map screen to the view space.
  return [
    viewport.unproject([0, 0]),
    viewport.unproject([viewport.width, 0]),
    viewport.unproject([viewport.width, viewport.height]),
    viewport.unproject([0, viewport.height])
  ];
}

function getPosition(boundingBox, position, length) {
  const viewLength = boundingBox[2][0] - boundingBox[0][0];
  switch (position) {
    case 'bottom-right': {
      const yCoord =
        boundingBox[2][1] - (boundingBox[2][1] - boundingBox[0][1]) * length;
      const xLeftCoord = boundingBox[2][0] - viewLength * length;
      return [yCoord, xLeftCoord];
    }
    case 'top-right': {
      const yCoord = (boundingBox[2][1] - boundingBox[0][1]) * length;
      const xLeftCoord = boundingBox[2][0] - viewLength * length;
      return [yCoord, xLeftCoord];
    }
    case 'top-left': {
      const yCoord = (boundingBox[2][1] - boundingBox[0][1]) * length;
      const xLeftCoord = viewLength * length;
      return [yCoord, xLeftCoord];
    }
    case 'bottom-left': {
      const yCoord =
        boundingBox[2][1] - (boundingBox[2][1] - boundingBox[0][1]) * length;
      const xLeftCoord = viewLength * length;
      return [yCoord, xLeftCoord];
    }
    default: {
      throw new Error(`Position ${position} not found`);
    }
  }
}

const defaultProps = {
  pickable: { type: 'boolean', value: true, compare: true },
  viewState: {
    type: 'object',
    value: { zoom: 0, target: [0, 0, 0] },
    compare: true
  },
  unit: { type: 'string', value: '', compare: true },
  size: { type: 'number', value: 1, compare: true },
  position: { type: 'string', value: 'bottom-right', compare: true },
  length: { type: 'number', value: 0.085, compare: true }
};
/**
 * @typedef LayerProps
 * @type {Object}
 * @property {String} unit Physical unit size per pixel at full resolution.
 * @property {Number} size Physical size of a pixel.
 * @property {Object} viewState The current viewState for the desired view.  We cannot internally use this.context.viewport because it is one frame behind:
 * https://github.com/visgl/deck.gl/issues/4504
 * @property {Array=} boundingBox Boudning box of the view in which this should render.
 * @property {string=} id Id from the parent layer.
 * @property {number=} length Value from 0 to 1 representing the portion of the view to be used for the length part of the scale bar.
 */

/**
 * @type {{ new(...props: LayerProps[]) }}
 * @ignore
 */
const ScaleBarLayer = class extends CompositeLayer {

  renderLayers() {
    const { id, unit, size, position, viewState, length, scaleFactor } = this.props;
    const boundingBox = makeBoundingBox(viewState);
    const { zoom } = viewState;
    const viewLength = boundingBox[2][0] - boundingBox[0][0];
    const barLength = viewLength * 0.05;

    const adjustment = barLength * scaleFactor;

    // This is a good heuristic for stopping the bar tick marks from getting too small
    // and/or the text squishing up into the bar.
    const barHeight = Math.max(
      2 ** (-zoom + 1.5),
      (boundingBox[2][1] - boundingBox[0][1]) * 0.007
    );
    
    const numUnits = barLength * size;
    const [yCoord, xLeftCoord] = getPosition(boundingBox, position, length);

    const lengthBar = new LineLayer({
      id: `scale-bar-length-${id}`,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [
        [
          [xLeftCoord - adjustment, yCoord],
          [xLeftCoord + barLength, yCoord]
        ]
      ],
      getSourcePosition: d => d[0],
      getTargetPosition: d => d[1],
      getWidth: 2,
      getColor: [220, 220, 220]
    });
    const tickBoundsLeft = new LineLayer({
      id: `scale-bar-height-left-${id}`,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [
        [
          [xLeftCoord - adjustment, yCoord - barHeight],
          [xLeftCoord - adjustment, yCoord + barHeight]
        ]
      ],

      getSourcePosition: d => d[0],
      getTargetPosition: d => d[1],
      getWidth: 2,
      getColor: [220, 220, 220]
    });
    const tickBoundsRight = new LineLayer({
      id: `scale-bar-height-right-${id}`,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [
        [
          [xLeftCoord + barLength, yCoord - barHeight],
          [xLeftCoord + barLength, yCoord + barHeight]
        ]
      ],
      getSourcePosition: d => d[0],
      getTargetPosition: d => d[1],
      getWidth: 2,
      getColor: [220, 220, 220]
    });
    
    function snapToRound(value) {
      const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
      const leadingDigit = Math.round(value / magnitude);
      
      return leadingDigit * magnitude;
    }
    
    const numUnitsRounded = snapToRound(numUnits);

    const data = [{
      text: numUnitsRounded + unit,
      position: [xLeftCoord + barLength * 0.5, yCoord + barHeight * 4]
    }]
    const textLayer = new TextLayer({
      id: 'text-layer',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data,
      pickable: true,
      getPosition: d => d.position,
      getText: d => d.text,
      getSize: 12,
      sizeUnits: 'meters',
      sizeScale: 2 ** -zoom,
      characterSet: [
        ...unit.split(''),
        ...range(10).map(i => String(i)),
        '.',
        'e',
        '+'
      ],
      getColor: [220, 220, 220, 255]
    });


    return [lengthBar, tickBoundsLeft, tickBoundsRight, textLayer];
  }
};

ScaleBarLayer.layerName = 'ScaleBarLayer';
ScaleBarLayer.defaultProps = defaultProps;
export default ScaleBarLayer;