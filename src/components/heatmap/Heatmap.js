import React, {
  useState, useCallback, useMemo, useEffect, forwardRef,
} from 'react';
import uuidv4 from 'uuid/v4';
import DeckGL from 'deck.gl';
// eslint-disable-next-line import/no-extraneous-dependencies
import GL from '@luma.gl/constants';
import { Texture2D } from '@luma.gl/core';
import { OrthographicView } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import range from 'lodash/range';
import clamp from 'lodash/clamp';
import isEqual from 'lodash/isEqual';
import { max } from 'd3-array';
import HeatmapCompositeTextLayer from '../../layers/HeatmapCompositeTextLayer';
import PixelatedBitmapLayer from '../../layers/PixelatedBitmapLayer';
import HeatmapBitmapLayer from '../../layers/HeatmapBitmapLayer';
import {
  DEFAULT_GL_OPTIONS,
  createDefaultUpdateCellsHover,
  createDefaultUpdateGenesHover,
  createDefaultUpdateViewInfo,
} from '../utils';
import {
  layerFilter,
  getAxisSizes,
  mouseToHeatmapPosition,
  heatmapToMousePosition,
} from './utils';
import {
  TILE_SIZE, MAX_ROW_AGG, MIN_ROW_AGG,
  COLOR_BAR_SIZE,
  AXIS_MARGIN,
  DATA_TEXTURE_SIZE,
  PIXELATED_TEXTURE_PARAMETERS,
} from '../../layers/heatmap-constants';

// Only allocate the memory once for the container
const paddedExpressionContainers = [
  new Uint8Array(DATA_TEXTURE_SIZE * DATA_TEXTURE_SIZE),
  new Uint8Array(DATA_TEXTURE_SIZE * DATA_TEXTURE_SIZE),
  new Uint8Array(DATA_TEXTURE_SIZE * DATA_TEXTURE_SIZE),
  new Uint8Array(DATA_TEXTURE_SIZE * DATA_TEXTURE_SIZE),
];

/**
 * A heatmap component for cell x gene matrices.
 * @param {object} props
 * @param {string} props.uuid The uuid of this component,
 * used by tooltips to determine whether to render a tooltip or
 * a crosshair.
 * @param {string} props.theme The current theme name.
 * @param {object} props.initialViewState The initial viewState for
 * DeckGL.
 * @param {number} props.width The width of the canvas.
 * @param {number} props.height The height of the canvas.
 * @param {object} props.expressionMatrix An object { rows, cols, matrix },
 * where matrix is a flat Uint8Array, rows is a list of cell ID strings,
 * and cols is a list of gene ID strings.
 * @param {Map} props.cellColors Map of cell ID to color. Optional.
 * If defined, the key ordering is used to order the cell axis of the heatmap.
 * @param {function} props.clearPleaseWait The clear please wait callback,
 * called when the expression matrix has loaded (is not null).
 * @param {function} props.setCellHighlight Callback function called on
 * hover with the cell ID. Optional.
 * @param {function} props.setGeneHighlight Callback function called on
 * hover with the gene ID. Optional.
 * @param {function} props.updateViewInfo Callback function that gets called with an
 * object { uuid, project() } where project is a function that maps (cellId, geneId)
 * to canvas (x,y) coordinates. Used to show tooltips. Optional.
 * @param {boolean} props.transpose By default, false.
 * @param {string} props.variablesTitle By default, 'Genes'.
 * @param {string} props.observationsTitle By default, 'Cells'.
 * @param {string} props.colormap The name of the colormap function to use.
 * @param {array} props.colormapRange A tuple [lower, upper] to adjust the color scale.
 * @param {function} props.setColormapRange The setter function for colormapRange.
 */
const Heatmap = forwardRef((props, deckRef) => {
  const {
    uuid,
    theme,
    viewState: rawViewState,
    setViewState,
    width: viewWidth,
    height: viewHeight,
    expressionMatrix: expression,
    cellColors,
    colormap,
    colormapRange,
    clearPleaseWait,
    setComponentHover,
    setCellHighlight = createDefaultUpdateCellsHover('Heatmap'),
    setGeneHighlight = createDefaultUpdateGenesHover('Heatmap'),
    updateViewInfo = createDefaultUpdateViewInfo('Heatmap'),
    setIsRendering = () => {},
    transpose = false,
    variablesTitle = 'Genes',
    observationsTitle = 'Cells',
  } = props;

  const viewState = {
    ...rawViewState,
    target: (transpose ? [rawViewState.target[1], rawViewState.target[0]] : rawViewState.target),
    minZoom: 0,
  };

  const axisLeftTitle = (transpose ? variablesTitle : observationsTitle);
  const axisTopTitle = (transpose ? observationsTitle : variablesTitle);

  useEffect(() => {
    if (clearPleaseWait && expression) {
      clearPleaseWait('expression-matrix');
    }
  }, [clearPleaseWait, expression]);

  const [axisLeftLabels, setAxisLeftLabels] = useState([]);
  const [axisTopLabels, setAxisTopLabels] = useState([]);


  // Check if the ordering of axis labels needs to be changed,
  // for example if the cells "selected" (technically just colored)
  // have changed.
  useEffect(() => {
    if (!expression) {
      return;
    }
    const newCellOrdering = (!cellColors || cellColors.size === 0
      ? expression.rows
      : Array.from(cellColors.keys())
    );
    const oldCellOrdering = (transpose ? axisTopLabels : axisLeftLabels);

    if (!isEqual(oldCellOrdering, newCellOrdering)) {
      if (transpose) {
        setAxisTopLabels(newCellOrdering);
      } else {
        setAxisLeftLabels(newCellOrdering);
      }
    }
  }, [expression, cellColors, axisTopLabels, axisLeftLabels, transpose]);

  // Set the genes ordering.
  useEffect(() => {
    if (!expression) {
      return;
    }
    if (transpose) {
      setAxisLeftLabels(expression.cols);
    } else {
      setAxisTopLabels(expression.cols);
    }
  }, [expression, transpose]);

  const [cellLabelMaxLength, geneLabelMaxLength] = useMemo(() => {
    if (!expression) {
      return [0, 0];
    }
    return [
      max(expression.rows.map(cellId => cellId.length)),
      max(expression.cols.map(geneId => geneId.length)),
    ];
  }, [expression]);

  // Creating a look up dictionary once is faster than calling indexOf many times
  // i.e when cell ordering changes.
  const expressionRowLookUp = useMemo(() => {
    const lookUp = {};
    if (expression?.rows) {
      // eslint-disable-next-line no-return-assign
      expression.rows.forEach((cell, j) => (lookUp[cell] = j));
    }
    return lookUp;
  }, [expression]);

  const width = axisTopLabels.length;
  const height = axisLeftLabels.length;

  const [axisOffsetLeft, axisOffsetTop] = getAxisSizes(
    transpose, geneLabelMaxLength, cellLabelMaxLength,
  );
  const [gl, setGlContext] = useState(null);

  const offsetTop = axisOffsetTop + COLOR_BAR_SIZE;
  const offsetLeft = axisOffsetLeft + COLOR_BAR_SIZE;

  const matrixWidth = viewWidth - offsetLeft;
  const matrixHeight = viewHeight - offsetTop;

  const matrixLeft = -matrixWidth / 2;
  const matrixRight = matrixWidth / 2;
  const matrixTop = -matrixHeight / 2;
  const matrixBottom = matrixHeight / 2;

  const xTiles = Math.ceil(width / TILE_SIZE);
  const yTiles = Math.ceil(height / TILE_SIZE);

  const widthRatio = 1 - (TILE_SIZE - (width % TILE_SIZE)) / (xTiles * TILE_SIZE);
  const heightRatio = 1 - (TILE_SIZE - (height % TILE_SIZE)) / (yTiles * TILE_SIZE);

  const tileWidth = (matrixWidth / widthRatio) / (xTiles);
  const tileHeight = (matrixHeight / heightRatio) / (yTiles);
  const scaleFactor = 2 ** viewState.zoom;
  const cellHeight = (matrixHeight * scaleFactor) / height;
  const cellWidth = (matrixWidth * scaleFactor) / width;

  // Get power of 2 between 1 and 16,
  // for number of cells to aggregate together in each direction.
  const aggSizeX = clamp(2 ** Math.ceil(Math.log2(1 / cellWidth)), MIN_ROW_AGG, MAX_ROW_AGG);
  const aggSizeY = clamp(2 ** Math.ceil(Math.log2(1 / cellHeight)), MIN_ROW_AGG, MAX_ROW_AGG);

  const [targetX, targetY] = viewState.target;

  // Emit the viewInfo object on viewState updates
  // (used by tooltips / crosshair elements).
  useEffect(() => {
    updateViewInfo({
      uuid,
      project: (cellId, geneId) => {
        const colI = transpose ? axisTopLabels.indexOf(cellId) : axisTopLabels.indexOf(geneId);
        const rowI = transpose ? axisLeftLabels.indexOf(geneId) : axisLeftLabels.indexOf(cellId);
        return heatmapToMousePosition(
          colI, rowI, {
            offsetLeft,
            offsetTop,
            targetX: viewState.target[0],
            targetY: viewState.target[1],
            scaleFactor,
            matrixWidth,
            matrixHeight,
            numRows: height,
            numCols: width,
          },
        );
      },
    });
  }, [uuid, updateViewInfo, transpose, axisTopLabels, axisLeftLabels, offsetLeft,
    offsetTop, viewState, scaleFactor, matrixWidth, matrixHeight, height, width]);


  // Listen for viewState changes.
  // Do not allow the user to zoom and pan outside of the initial window.
  const onViewStateChange = useCallback(({ viewState: nextViewState }) => {
    const { zoom: nextZoom } = nextViewState;
    const nextScaleFactor = 2 ** nextZoom;

    const minTargetX = nextZoom === 0 ? 0 : -(matrixRight - (matrixRight / nextScaleFactor));
    const maxTargetX = -1 * minTargetX;

    const minTargetY = nextZoom === 0 ? 0 : -(matrixBottom - (matrixBottom / nextScaleFactor));
    const maxTargetY = -1 * minTargetY;

    // Manipulate view state if necessary to keep the user in the window.
    const nextTarget = [
      clamp(nextViewState.target[0], minTargetX, maxTargetX),
      clamp(nextViewState.target[1], minTargetY, maxTargetY),
    ];

    setViewState({
      zoom: nextZoom,
      target: (transpose ? [nextTarget[1], nextTarget[0]] : nextTarget),
    });
  }, [matrixRight, matrixBottom, transpose, setViewState]);

  // Create the padded expression matrix for holding data which can then be bound to the GPU.
  const paddedExpressions = useMemo(() => {
    setIsRendering(true);
    const cellOrdering = transpose ? axisTopLabels : axisLeftLabels;
    if (expression?.matrix && cellOrdering.length && gl) {
      let newIndex = 0;
      for (
        let cellOrderingIndex = 0; cellOrderingIndex < cellOrdering.length; cellOrderingIndex += 1
      ) {
        const cell = cellOrdering[cellOrderingIndex];
        newIndex = transpose ? cellOrderingIndex : newIndex;
        const cellIndex = expressionRowLookUp[cell];
        for (let geneIndex = 0; geneIndex < expression.cols.length; geneIndex += 1) {
          const index = cellIndex * expression.cols.length + geneIndex;
          const container = Math.floor(newIndex / (DATA_TEXTURE_SIZE * DATA_TEXTURE_SIZE));
          paddedExpressionContainers[container][
            newIndex % (DATA_TEXTURE_SIZE * DATA_TEXTURE_SIZE)
          ] = expression.matrix[index];
          newIndex = (transpose ? newIndex + cellOrdering.length : newIndex + 1);
        }
      }
    }
    setIsRendering(false);
    return paddedExpressionContainers.map(image => (gl ? new Texture2D(gl, {
      data: image,
      mipmaps: false,
      parameters: PIXELATED_TEXTURE_PARAMETERS,
      // Each color contains a single luminance value.
      // When sampled, rgb are all set to this luminance, alpha is 1.0.
      // Reference: https://luma.gl/docs/api-reference/webgl/texture#texture-formats
      format: GL.LUMINANCE,
      dataFormat: GL.LUMINANCE,
      type: GL.UNSIGNED_BYTE,
      width: DATA_TEXTURE_SIZE,
      height: DATA_TEXTURE_SIZE,
    }) : image));
  }, [setIsRendering, transpose, axisTopLabels,
    axisLeftLabels, expression, expressionRowLookUp, gl]);


  // Update the heatmap tiles if:
  // - the matrix bounds have changed, or
  // - the `aggSizeX` or `aggSizeY` have changed, or
  // - the cell ordering has changed.
  const heatmapLayers = useMemo(() => {
    const cellOrdering = transpose ? axisTopLabels : axisLeftLabels;
    function getLayer(i, j) {
      const { cols } = expression;
      return new HeatmapBitmapLayer({
        id: `heatmapLayer-${i}-${j}`,
        images: paddedExpressions,
        bounds: [
          matrixLeft + j * tileWidth,
          matrixTop + i * tileHeight,
          matrixLeft + (j + 1) * tileWidth,
          matrixTop + (i + 1) * tileHeight,
        ],
        tileI: i,
        tileJ: j,
        numXTiles: xTiles,
        numYTiles: yTiles,
        origDataSize:
          transpose ? [cols.length, cellOrdering.length] : [cellOrdering.length, cols.length],
        aggSizeX,
        aggSizeY,
        colormap,
        colorScaleLo: colormapRange[0],
        colorScaleHi: colormapRange[1],
        updateTriggers: {
          image: [axisLeftLabels, axisTopLabels],
          bounds: [tileHeight, tileWidth],
        },
      });
    }
    const layers = range(yTiles * xTiles)
      .map(index => getLayer(Math.floor(index / xTiles), index % xTiles));
    return layers;
  }, [yTiles, xTiles, expression, paddedExpressions, matrixLeft,
    tileWidth, matrixTop, tileHeight, transpose, aggSizeX, aggSizeY,
    colormap, colormapRange, axisLeftLabels, axisTopLabels]);


  // Map cell and gene names to arrays with indices,
  // to prepare to render the names in TextLayers.
  const axisTopLabelData = useMemo(() => axisTopLabels.map((d, i) => [i, d]), [axisTopLabels]);
  const axisLeftLabelData = useMemo(() => axisLeftLabels.map((d, i) => [i, d]), [axisLeftLabels]);

  // Generate the axis label, axis title, and loading indicator text layers.
  const textLayers = [
    new HeatmapCompositeTextLayer({
      axis: 'left',
      id: 'axisLeftCompositeTextLayer',
      targetX,
      targetY,
      scaleFactor,
      axisLeftLabelData,
      matrixTop,
      height,
      matrixHeight,
      cellHeight,
      cellWidth,
      axisTopLabelData,
      matrixLeft,
      width,
      matrixWidth,
      viewHeight,
      viewWidth,
      theme,
      axisLeftTitle,
      axisTopTitle,
      axisOffsetLeft,
      axisOffsetTop,
    }),
    new HeatmapCompositeTextLayer({
      axis: 'top',
      id: 'axisTopCompositeTextLayer',
      targetX,
      targetY,
      scaleFactor,
      axisLeftLabelData,
      matrixTop,
      height,
      matrixHeight,
      cellHeight,
      cellWidth,
      axisTopLabelData,
      matrixLeft,
      width,
      matrixWidth,
      viewHeight,
      viewWidth,
      theme,
      axisLeftTitle,
      axisTopTitle,
      axisOffsetLeft,
      axisOffsetTop,
    }),
  ];

  // Create the left color bar with a BitmapLayer.
  // TODO: find a way to do aggregation for this as well.
  const cellColorsTiles = useMemo(() => {
    if (!cellColors) {
      return null;
    }

    let cellId;
    let offset;
    let color;
    let rowI;

    const cellOrdering = (transpose ? axisTopLabels : axisLeftLabels);
    const colorBarTileWidthPx = (transpose ? TILE_SIZE : 1);
    const colorBarTileHeightPx = (transpose ? 1 : TILE_SIZE);

    const result = range((transpose ? xTiles : yTiles)).map((i) => {
      const tileData = new Uint8ClampedArray(TILE_SIZE * 1 * 4);

      range(TILE_SIZE).forEach((tileY) => {
        rowI = (i * TILE_SIZE) + tileY; // the row / cell index
        if (rowI < cellOrdering.length) {
          cellId = cellOrdering[rowI];
          color = cellColors.get(cellId);
          offset = (transpose ? tileY : (TILE_SIZE - tileY - 1)) * 4;
          if (color) {
            const [rValue, gValue, bValue] = color;
            tileData[offset + 0] = rValue;
            tileData[offset + 1] = gValue;
            tileData[offset + 2] = bValue;
            tileData[offset + 3] = 255;
          }
        }
      });

      return new ImageData(tileData, colorBarTileWidthPx, colorBarTileHeightPx);
    });

    return result;
  }, [cellColors, transpose, axisTopLabels, axisLeftLabels, xTiles, yTiles]);

  const cellColorsLayers = useMemo(() => (cellColorsTiles
    ? cellColorsTiles
      .map((tile, i) => new PixelatedBitmapLayer({
        id: `${(transpose ? 'colorsTopLayer' : 'colorsLeftLayer')}-${i}-${uuidv4()}`,
        image: tile,
        bounds: (transpose ? [
          matrixLeft + i * tileWidth,
          -matrixHeight / 2,
          matrixLeft + (i + 1) * tileWidth,
          matrixHeight / 2,
        ] : [
          -matrixWidth / 2,
          matrixTop + i * tileHeight,
          matrixWidth / 2,
          matrixTop + (i + 1) * tileHeight,
        ]),
      }))
    : []), [cellColorsTiles, matrixTop, matrixLeft, matrixHeight,
    matrixWidth, tileWidth, tileHeight, transpose]);

  const layers = heatmapLayers
    .concat(textLayers)
    .concat(cellColorsLayers);

  // Set up the onHover function.
  function onHover(info, event) {
    if (!expression) {
      return;
    }
    const { x: mouseX, y: mouseY } = event.offsetCenter;
    const [colI, rowI] = mouseToHeatmapPosition(mouseX, mouseY, {
      offsetLeft,
      offsetTop,
      targetX,
      targetY,
      scaleFactor,
      matrixWidth,
      matrixHeight,
      numRows: height,
      numCols: width,
    });

    if (colI === null) {
      if (transpose) {
        setCellHighlight(null);
      } else {
        setGeneHighlight(null);
      }
    }

    if (rowI === null) {
      if (transpose) {
        setGeneHighlight(null);
      } else {
        setCellHighlight(null);
      }
    }

    const obsI = expression.rows.indexOf(transpose
      ? axisTopLabels[colI]
      : axisLeftLabels[rowI]);
    const varI = expression.cols.indexOf(transpose
      ? axisLeftLabels[rowI]
      : axisTopLabels[colI]);

    const obsId = expression.rows[obsI];
    const varId = expression.cols[varI];
    if (setComponentHover) {
      setComponentHover();
    }
    setCellHighlight(obsId || null);
    setGeneHighlight(varId || null);
  }

  return (
    <DeckGL
      id={`deckgl-overlay-${uuid}`}
      ref={deckRef}
      onWebGLInitialized={setGlContext}
      views={[
        // Note that there are multiple views here,
        // but only one viewState.
        new OrthographicView({
          id: 'heatmap',
          controller: true,
          x: offsetLeft,
          y: offsetTop,
          width: matrixWidth,
          height: matrixHeight,
        }),
        new OrthographicView({
          id: 'axisLeft',
          controller: false,
          x: transpose ? COLOR_BAR_SIZE : 0,
          y: offsetTop,
          width: axisOffsetLeft,
          height: matrixHeight,
        }),
        new OrthographicView({
          id: 'axisTop',
          controller: false,
          x: offsetLeft,
          y: transpose ? 0 : COLOR_BAR_SIZE,
          width: matrixWidth,
          height: axisOffsetTop,
        }),
        new OrthographicView({
          id: 'colorsLeft',
          controller: false,
          x: axisOffsetLeft,
          y: offsetTop,
          width: COLOR_BAR_SIZE - AXIS_MARGIN,
          height: matrixHeight,
        }),
        new OrthographicView({
          id: 'colorsTop',
          controller: false,
          x: offsetLeft,
          y: axisOffsetTop,
          width: matrixWidth,
          height: COLOR_BAR_SIZE - AXIS_MARGIN,
        }),
      ]}
      layers={layers}
      layerFilter={layerFilter}
      getCursor={interactionState => (interactionState.isDragging ? 'grabbing' : 'default')}
      glOptions={DEFAULT_GL_OPTIONS}
      onViewStateChange={onViewStateChange}
      viewState={viewState}
      onHover={onHover}
    />
  );
});

export default Heatmap;
