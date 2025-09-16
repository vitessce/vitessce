/* eslint-disable react/display-name */
import React, {
  useRef, useState, useCallback, useMemo, useEffect, useReducer, forwardRef,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  deck, luma,
  HeatmapCompositeTextLayer,
  PixelatedBitmapLayer,
  PaddedExpressionHeatmapBitmapLayer,
  HeatmapBitmapLayer,
  TILE_SIZE,
  MAX_ROW_AGG,
  MIN_ROW_AGG,
  COLOR_BAR_SIZE,
  AXIS_MARGIN,
  DATA_TEXTURE_SIZE,
  PIXELATED_TEXTURE_PARAMETERS,
} from '@vitessce/gl';
import { range, clamp, isEqual } from 'lodash-es';
import {
  getLongestString,
  DEFAULT_GL_OPTIONS,
  createDefaultUpdateCellsHover,
  createDefaultUpdateGenesHover,
  createDefaultUpdateTracksHover,
  createDefaultUpdateViewInfo,
  copyUint8Array,
  getDefaultColor,
  cleanFeatureId,
} from '@vitessce/utils';


import {
  layerFilter,
  getAxisSizes,
  mouseToHeatmapPosition,
  heatmapToMousePosition,
  mouseToCellColorPosition,
} from './utils.js';
import HeatmapWorkerPool from './HeatmapWorkerPool.js';
// Only allocate the memory once for the container
const paddedExpressionContainer = new Uint8Array(DATA_TEXTURE_SIZE * DATA_TEXTURE_SIZE);

/**
 * Should the "padded" implementation
 * be used? Only works if the number of heatmap values is
 * <=  4096^2 = ~16 million.
 * @param {number|null} dataLength The number of heatmap values.
 * @returns {boolean} Whether the more efficient implementation should be used.
 */
function shouldUsePaddedImplementation(dataLength) {
  return dataLength <= DATA_TEXTURE_SIZE ** 2;
}

/**
 * A heatmap component for cell x gene matrices.
 * @param {object} props
 * @param {string} props.uuid The uuid of this component,
 * used by tooltips to determine whether to render a tooltip or
 * a crosshair.
 * @param {string} props.theme The current theme name.
 * @param {object} props.viewState The viewState for
 * DeckGL.
 * @param {function} props.setViewState The viewState setter
 * for DeckGL.
 * @param {number} props.width The width of the canvas.
 * @param {number} props.height The height of the canvas.
 * @param {null|Uint8Array} props.uint8ObsFeatureMatrix A flat Uint8Array
 * containing the expression data.
 * @param {Map} props.cellColors Map of cell ID to color. Optional.
 * If defined, the key ordering is used to order the cell axis of the heatmap.
 * @param {array} props.cellColorLabels array of labels to place beside cell color
 * tracks. Only works for transpose=true.
 * @param {function} props.setCellHighlight Callback function called on
 * hover with the cell ID. Optional.
 * @param {function} props.setGeneHighlight Callback function called on
 * hover with the gene ID. Optional.
 * @param {function} props.updateViewInfo Callback function that gets called with an
 * object { uuid, project(), projectFromId() } where
 * project is the DeckGL Viewport.project function, and
 * projectFromId is a wrapper around project that
 * takes (cellId, geneId) as parameters and returns
 * canvas (x,y) pixel coordinates. Used to show tooltips. Optional.
 * @param {boolean} props.transpose By default, false.
 * @param {string} props.variablesTitle By default, 'Genes'.
 * @param {string} props.observationsTitle By default, 'Cells'.
 * @param {number} props.useDevicePixels By default, 1. Higher values
 * e.g. 2 increase text sharpness.
 * @param {boolean} props.hideObservationLabels By default false.
 * @param {boolean} props.hideVariableLabels By default false.
 * @param {string} props.colormap The name of the colormap function to use.
 * @param {array} props.colormapRange A tuple [lower, upper] to adjust the color scale.
 * @param {function} props.setColormapRange The setter function for colormapRange.
 * @param {string[]} props.obsIndex The cell ID list.
 * @param {string[]} props.featureIndex The gene ID list.
 * @param {null|Map<string,string>} props.featureLabelsMap A map of featureIndex to featureLabel.
 */
const Heatmap = forwardRef((props, deckRef) => {
  const {
    uuid,
    theme,
    viewState: rawViewState,
    setViewState,
    width: viewWidth,
    height: viewHeight,
    uint8ObsFeatureMatrix,
    cellColors,
    cellColorLabels = [''],
    colormap,
    colormapRange,
    setComponentHover,
    setCellHighlight = createDefaultUpdateCellsHover('Heatmap'),
    setGeneHighlight = createDefaultUpdateGenesHover('Heatmap'),
    setTrackHighlight = createDefaultUpdateTracksHover('Heatmap'),
    updateViewInfo = createDefaultUpdateViewInfo('Heatmap'),
    setIsRendering = () => {},
    transpose = false,
    variablesTitle = 'Genes',
    observationsTitle = 'Cells',
    variablesDashes = true,
    observationsDashes = true,
    useDevicePixels = 1,
    hideObservationLabels = false,
    hideVariableLabels = false,
    onHeatmapClick,
    setColorEncoding,
    obsIndex,
    featureIndex,
    featureLabelsMap,
  } = props;

  const viewState = {
    ...rawViewState,
    target: (transpose ? [rawViewState.target[1], rawViewState.target[0]] : rawViewState.target),
    minZoom: 0,
  };

  const axisLeftTitle = (transpose ? variablesTitle : observationsTitle);
  const axisTopTitle = (transpose ? observationsTitle : variablesTitle);

  const workerPool = useMemo(() => new HeatmapWorkerPool(), []);

  const tilesRef = useRef();
  const dataRef = useRef();
  const [axisLeftLabels, setAxisLeftLabels] = useState([]);
  const [axisTopLabels, setAxisTopLabels] = useState([]);
  const [numCellColorTracks, setNumCellColorTracks] = useState([]);
  const [cursorType, setCursorType] = useState('default');


  // Since we are storing the tile data in a ref,
  // and updating it asynchronously when the worker finishes,
  // we need to tie it to a piece of state through this iteration value.
  const [tileIteration, incTileIteration] = useReducer(i => i + 1, 0);

  // We need to keep a backlog of the tasks for the worker thread,
  // since the array buffer can only be held by one thread at a time.
  const [backlog, setBacklog] = useState([]);

  // Store a reference to the matrix Uint8Array in the dataRef,
  // since we need to access its array buffer to transfer
  // it back and forth from the worker thread.
  useEffect(() => {
    // Store the expression matrix Uint8Array in the dataRef.
    if (uint8ObsFeatureMatrix
      && !shouldUsePaddedImplementation(uint8ObsFeatureMatrix.length)
    ) {
      dataRef.current = copyUint8Array(uint8ObsFeatureMatrix);
    }
  }, [dataRef, uint8ObsFeatureMatrix]);

  // Check if the ordering of axis labels needs to be changed,
  // for example if the cells "selected" (technically just colored)
  // have changed.
  useEffect(() => {
    if (!obsIndex) {
      return;
    }

    const newCellOrdering = (!cellColors || cellColors.size === 0
      ? obsIndex
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
  }, [obsIndex, cellColors, axisTopLabels, axisLeftLabels, transpose]);

  // Set the genes ordering.
  useEffect(() => {
    if (!featureIndex) {
      return;
    }
    if (transpose) {
      setAxisLeftLabels(featureIndex);
    } else {
      setAxisTopLabels(featureIndex);
    }
  }, [featureIndex, transpose]);

  const [longestCellLabel, longestGeneLabel] = useMemo(() => {
    if (!obsIndex || !featureIndex) {
      return ['', ''];
    }

    return [
      getLongestString(obsIndex),
      getLongestString([...featureIndex, ...cellColorLabels]),
    ];
  }, [featureIndex, cellColorLabels, obsIndex]);

  // Creating a look up dictionary once is faster than calling indexOf many times
  // i.e when cell ordering changes.
  const expressionRowLookUp = useMemo(() => {
    const lookUp = new Map();
    if (obsIndex) {
      // eslint-disable-next-line no-return-assign
      obsIndex.forEach((cell, j) => (lookUp.set(cell, j)));
    }
    return lookUp;
  }, [obsIndex]);

  const width = axisTopLabels.length;
  const height = axisLeftLabels.length;

  const [axisOffsetLeft, axisOffsetTop] = getAxisSizes(
    transpose, longestGeneLabel, longestCellLabel,
    hideObservationLabels, hideVariableLabels,
  );
  const [gl, setGlContext] = useState(null);

  const offsetTop = axisOffsetTop + COLOR_BAR_SIZE * (transpose ? numCellColorTracks : 0);
  const offsetLeft = axisOffsetLeft + COLOR_BAR_SIZE * (transpose ? 0 : numCellColorTracks);

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
      projectFromId: (cellId, geneId) => {
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

  // If `expression` or `cellOrdering` have changed,
  // then new tiles need to be generated,
  // so add a new task to the backlog.
  useEffect(() => {
    if (!uint8ObsFeatureMatrix || uint8ObsFeatureMatrix.length < DATA_TEXTURE_SIZE ** 2) {
      return;
    }
    // Use a uuid to give the task a unique ID,
    // to help identify where in the list it is located
    // after the worker thread asynchronously sends the data back
    // to this thread.
    if (
      axisTopLabels && axisLeftLabels && xTiles && yTiles
    ) {
      setBacklog(prev => [...prev, uuidv4()]);
    }
  }, [dataRef, uint8ObsFeatureMatrix, axisTopLabels, axisLeftLabels, xTiles, yTiles]);

  // When the backlog has updated, a new worker job can be submitted if:
  // - the backlog has length >= 1 (at least one job is waiting), and
  // - buffer.byteLength is not zero, so the worker does not currently "own" the buffer.
  useEffect(() => {
    if (backlog.length < 1 || shouldUsePaddedImplementation(dataRef.current.length)) {
      return;
    }
    const curr = backlog[backlog.length - 1];
    if (dataRef.current
      && dataRef.current.buffer.byteLength && expressionRowLookUp.size > 0
      && !shouldUsePaddedImplementation(dataRef.current.length)) {
      const promises = range(yTiles).map(i => range(xTiles).map(async j => workerPool.process({
        curr,
        tileI: i,
        tileJ: j,
        tileSize: TILE_SIZE,
        cellOrdering: transpose ? axisTopLabels : axisLeftLabels,
        cols: featureIndex,
        transpose,
        data: uint8ObsFeatureMatrix.buffer.slice(),
        expressionRowLookUp,
      })));
      const process = async () => {
        const tiles = await Promise.all(promises.flat());
        tilesRef.current = tiles.map(i => i.tile);
        incTileIteration();
        dataRef.current = new Uint8Array(tiles[0].buffer);
        const { curr: currWork } = tiles[0];
        setBacklog((prev) => {
          const currIndex = prev.indexOf(currWork);
          return prev.slice(currIndex + 1, prev.length);
        });
      };
      process();
    }
  }, [axisLeftLabels, axisTopLabels, backlog, uint8ObsFeatureMatrix, transpose,
    xTiles, yTiles, workerPool, expressionRowLookUp, featureIndex]);

  useEffect(() => {
    setIsRendering(backlog.length > 0);
  }, [backlog, setIsRendering]);

  // Create the padded expression matrix for holding data which can then be bound to the GPU.
  const paddedExpressions = useMemo(() => {
    const cellOrdering = transpose ? axisTopLabels : axisLeftLabels;
    if (uint8ObsFeatureMatrix && cellOrdering.length
      && gl && shouldUsePaddedImplementation(uint8ObsFeatureMatrix.length)) {
      let newIndex = 0;
      for (
        let cellOrderingIndex = 0;
        cellOrderingIndex < cellOrdering.length;
        cellOrderingIndex += 1
      ) {
        const cell = cellOrdering[cellOrderingIndex];
        newIndex = transpose ? cellOrderingIndex : newIndex;
        const cellIndex = expressionRowLookUp.get(cell);
        for (
          let geneIndex = 0;
          geneIndex < featureIndex.length;
          geneIndex += 1
        ) {
          const index = cellIndex * featureIndex.length + geneIndex;
          paddedExpressionContainer[
            newIndex % (DATA_TEXTURE_SIZE * DATA_TEXTURE_SIZE)
          ] = uint8ObsFeatureMatrix[index];
          newIndex = transpose ? newIndex + cellOrdering.length : newIndex + 1;
        }
      }
    }
    return gl ? new luma.Texture2D(gl, {
      data: paddedExpressionContainer,
      mipmaps: false,
      parameters: PIXELATED_TEXTURE_PARAMETERS,
      // Each color contains a single luminance value.
      // When sampled, rgb are all set to this luminance, alpha is 1.0.
      // Reference: https://luma.gl/docs/api-reference/webgl/texture#texture-formats
      format: luma.GL.LUMINANCE,
      dataFormat: luma.GL.LUMINANCE,
      type: luma.GL.UNSIGNED_BYTE,
      width: DATA_TEXTURE_SIZE,
      height: DATA_TEXTURE_SIZE,
    }) : paddedExpressionContainer;
  }, [
    transpose,
    axisTopLabels,
    axisLeftLabels,
    uint8ObsFeatureMatrix,
    expressionRowLookUp,
    featureIndex,
    gl,
  ]);

  // Update the heatmap tiles if:
  // - new tiles are available (`tileIteration` has changed), or
  // - the matrix bounds have changed, or
  // - the `aggSizeX` or `aggSizeY` have changed, or
  // - the cell ordering has changed.
  const heatmapLayers = useMemo(() => {
    const usePaddedExpressions = uint8ObsFeatureMatrix
      && shouldUsePaddedImplementation(uint8ObsFeatureMatrix.length);
    if ((!tilesRef.current || backlog.length) && !usePaddedExpressions) {
      return [];
    }
    if (usePaddedExpressions) {
      const cellOrdering = transpose ? axisTopLabels : axisLeftLabels;
      // eslint-disable-next-line no-inner-declarations, no-shadow
      function getLayer(i, j) {
        return new PaddedExpressionHeatmapBitmapLayer({
          id: `heatmapLayer-${i}-${j}`,
          image: paddedExpressions,
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
          origDataSize: transpose
            ? [featureIndex.length, cellOrdering.length]
            : [cellOrdering.length, featureIndex.length],
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
      const layers = range(yTiles * xTiles).map(
        index => getLayer(Math.floor(index / xTiles), index % xTiles),
      );
      return layers;
    }
    function getLayer(i, j, tile) {
      return new HeatmapBitmapLayer({
        id: `heatmapLayer-${tileIteration}-${i}-${j}`,
        image: tile,
        bounds: [
          matrixLeft + j * tileWidth,
          matrixTop + i * tileHeight,
          matrixLeft + (j + 1) * tileWidth,
          matrixTop + (i + 1) * tileHeight,
        ],
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
    const layers = tilesRef.current.map(
      (tile, index) => getLayer(Math.floor(index / xTiles), index % xTiles, tile),
    );
    return layers;
  }, [uint8ObsFeatureMatrix, backlog.length, transpose, axisTopLabels, axisLeftLabels,
    paddedExpressions, matrixLeft, tileWidth, matrixTop, tileHeight, yTiles, xTiles,
    aggSizeX, aggSizeY, colormap, colormapRange, tileIteration, featureIndex]);
  const axisLeftDashes = (transpose ? variablesDashes : observationsDashes);
  const axisTopDashes = (transpose ? observationsDashes : variablesDashes);

  // Map cell and gene names to arrays with indices,
  // to prepare to render the names in TextLayers.
  // We do the mapping with featureLabelsMap here at one of the final steps before rendering
  // since it is for presentational purposes.
  const axisTopLabelData = useMemo(() => (!transpose && featureLabelsMap
    ? axisTopLabels.map(d => (
      featureLabelsMap.get(d)
      || featureLabelsMap.get(cleanFeatureId(d))
      || d
    ))
    : axisTopLabels
  ).map((d, i) => [i, (axisTopDashes ? `- ${d}` : d)]), [axisTopLabels, axisTopDashes, transpose, featureLabelsMap]);
  const axisLeftLabelData = useMemo(() => (transpose && featureLabelsMap
    ? axisLeftLabels.map(d => (
      featureLabelsMap.get(d)
      || featureLabelsMap.get(cleanFeatureId(d))
      || d
    ))
    : axisLeftLabels
  ).map((d, i) => [i, (axisLeftDashes ? `${d} -` : d)]), [axisLeftLabels, axisLeftDashes, transpose, featureLabelsMap]);
  const cellColorLabelsData = useMemo(() => cellColorLabels.map((d, i) => [i, d && (transpose ? `${d} -` : `- ${d}`)]), [cellColorLabels, transpose]);

  const hideTopLabels = (transpose ? hideObservationLabels : hideVariableLabels);
  const hideLeftLabels = (transpose ? hideVariableLabels : hideObservationLabels);

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
      hideTopLabels,
      hideLeftLabels,
      transpose,
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
      cellColorLabelsData,
      hideTopLabels,
      hideLeftLabels,
      transpose,
    }),
    new HeatmapCompositeTextLayer({
      axis: 'corner',
      id: 'cellColorLabelCompositeTextLayer',
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
      cellColorLabelsData,
      hideTopLabels,
      hideLeftLabels,
      transpose,
    }),
  ];

  useEffect(() => {
    setNumCellColorTracks(cellColorLabels.length);
  }, [cellColorLabels]);


  // Create the left color bar with a BitmapLayer.
  // TODO: find a way to do aggregation for this as well.
  const cellColorsTilesList = useMemo(() => {
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

    const result = range(numCellColorTracks).map((track) => {
      const trackResult = range((transpose ? xTiles : yTiles)).map((i) => {
        const tileData = new Uint8ClampedArray(TILE_SIZE * 1 * 4);

        range(TILE_SIZE).forEach((tileY) => {
          rowI = (i * TILE_SIZE) + tileY; // the row / cell index
          if (rowI < cellOrdering.length) {
            cellId = cellOrdering[rowI];
            color = cellColors.get(cellId);

            offset = (transpose ? tileY : (TILE_SIZE - tileY - 1)) * 4;

            if (color) {
              // allows color to be [R, G, B] or array of arrays of [R, G, B]
              if (typeof color[0] !== 'number') color = color[track] ?? getDefaultColor(theme);

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

      return trackResult;
    });

    return result;
  }, [cellColors, transpose, axisTopLabels, axisLeftLabels,
    numCellColorTracks, xTiles, yTiles, theme]);


  const cellColorsLayersList = useMemo(() => {
    if (!cellColorsTilesList) {
      return [];
    }

    const result = cellColorsTilesList.map((cellColorsTiles, track) => (cellColorsTiles
      ? cellColorsTiles.map((tile, i) => new PixelatedBitmapLayer({
        id: `${(transpose ? 'colorsTopLayer' : 'colorsLeftLayer')}-${track}-${i}-${uuidv4()}`,
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
      : []));

    return (result);
  }, [cellColorsTilesList, matrixTop, matrixLeft, matrixHeight,
    matrixWidth, tileWidth, tileHeight, transpose]);


  const showText = width > 0 && height > 0;
  const layers = heatmapLayers
    .concat(showText ? textLayers : [])
    .concat(...cellColorsLayersList);

  // Set up the onHover function.
  function onHover(info, event) {
    if (!uint8ObsFeatureMatrix) {
      return;
    }

    let highlightedCell = null;
    let highlightedGene = null;

    const { x: mouseX, y: mouseY } = event.offsetCenter;

    const [trackColI, trackI] = mouseToCellColorPosition(mouseX, mouseY, {
      axisOffsetTop,
      axisOffsetLeft,
      offsetTop,
      offsetLeft,
      colorBarSize: COLOR_BAR_SIZE,
      numCellColorTracks,
      transpose,
      targetX,
      targetY,
      scaleFactor,
      matrixWidth,
      matrixHeight,
      numRows: height,
      numCols: width,
    });

    // we are hovering over a gene colored track
    if (trackI === null || trackColI === null) {
      setTrackHighlight(null);
      setColorEncoding('geneSelection');
    } else { // we are hovering over a cell colored track
      const obsI = obsIndex.indexOf(transpose
        ? axisTopLabels[trackColI]
        : axisLeftLabels[trackColI]);
      const cellIndex = obsIndex[obsI];
      setTrackHighlight([cellIndex, trackI, mouseX, mouseY]);
      highlightedCell = cellIndex;
      setColorEncoding('cellSelection');
    }

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

    const obsI = obsIndex.indexOf(transpose
      ? axisTopLabels[colI]
      : axisLeftLabels[rowI]);
    const varI = featureIndex.indexOf(transpose
      ? axisLeftLabels[rowI]
      : axisTopLabels[colI]);

    const obsId = obsIndex[obsI];

    // We need to use featureIndex here,
    // because featureIndex may be mapped to
    // use featureLabels (if those were available in the dataset).
    // Highlights and selections are assumed to be in terms of
    // obsIndex/featureIndex (as opposed to obsLabels/featureLabels).
    const varId = featureIndex[varI];

    if (setComponentHover) {
      setComponentHover();
    }

    if (obsId) {
      highlightedCell = obsId;
    }
    if (varId) {
      highlightedGene = varId;
    }

    setCellHighlight(highlightedCell);
    setGeneHighlight(highlightedGene);
    if (highlightedCell !== null || highlightedGene !== null) {
      setCursorType('pointer');
    } else {
      setCursorType('default');
    }
  }

  const cellColorsViews = useMemo(() => {
    const result = range(numCellColorTracks).map((track) => {
      let view;
      if (transpose) {
        view = new deck.OrthographicView({
          id: `colorsTop-${track}`,
          controller: true,
          x: offsetLeft,
          y: axisOffsetTop + track * COLOR_BAR_SIZE,
          width: matrixWidth,
          height: COLOR_BAR_SIZE - AXIS_MARGIN,
        });
      } else {
        view = new deck.OrthographicView({
          id: `colorsLeft-${track}`,
          controller: true,
          x: axisOffsetLeft + track * COLOR_BAR_SIZE,
          y: offsetTop,
          width: COLOR_BAR_SIZE - AXIS_MARGIN,
          height: matrixHeight,
        });
      }
      return view;
    });

    return result;
  }, [numCellColorTracks, transpose, offsetLeft, axisOffsetTop,
    matrixWidth, axisOffsetLeft, offsetTop, matrixHeight]);

  return (
    <deck.DeckGL
      id={`deckgl-overlay-${uuid}`}
      ref={deckRef}
      onWebGLInitialized={setGlContext}
      views={[
        // Note that there are multiple views here,
        // but only one viewState.
        new deck.OrthographicView({
          id: 'heatmap',
          controller: true,
          x: offsetLeft,
          y: offsetTop,
          width: matrixWidth,
          height: matrixHeight,
        }),
        new deck.OrthographicView({
          id: 'axisLeft',
          controller: false,
          x: 0,
          y: offsetTop,
          width: axisOffsetLeft,
          height: matrixHeight,
        }),
        new deck.OrthographicView({
          id: 'axisTop',
          controller: false,
          x: offsetLeft,
          y: 0,
          width: matrixWidth,
          height: axisOffsetTop,
        }),
        new deck.OrthographicView({
          id: 'cellColorLabel',
          controller: false,
          x: (transpose ? 0 : axisOffsetLeft),
          y: (transpose ? axisOffsetTop : 0),
          width: (transpose ? axisOffsetLeft : COLOR_BAR_SIZE * numCellColorTracks),
          height: (transpose ? COLOR_BAR_SIZE * numCellColorTracks : axisOffsetTop),
        }),
        ...cellColorsViews,
      ]}
      layers={layers}
      layerFilter={layerFilter}
      getCursor={interactionState => (interactionState.isDragging ? 'grabbing' : cursorType)}
      glOptions={DEFAULT_GL_OPTIONS}
      onViewStateChange={onViewStateChange}
      viewState={viewState}
      onHover={onHover}
      useDevicePixels={useDevicePixels}
      onClick={onHeatmapClick}
      width="100%"
      height="100%"
    />
  );
});

Heatmap.displayName = 'Heatmap';

export default Heatmap;
