/* eslint-disable */
import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { extent } from 'd3-array';
import clamp from 'lodash/clamp';
import isEqual from 'lodash/isEqual';
import TitleInfo from '../TitleInfo';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls } from '../hooks';
import { setCellSelection, mergeCellSets } from '../utils';
import { getCellSetPolygons } from '../sets/cell-set-utils';
import {
  useCellsData,
  useCellSetsData,
  useGeneSelection,
  useExpressionAttrs,
} from '../data-hooks';
import { getCellColors } from '../interpolate-colors';
import Scatterplot from './Scatterplot';
import ScatterplotTooltipSubscriber from './ScatterplotTooltipSubscriber';
import ScatterplotOptions from './ScatterplotOptions';
import {
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

const SCATTERPLOT_DATA_TYPES = ['cells', 'expression-matrix', 'cell-sets'];

/**
 * A subscriber component for the scatterplot.
 * @param {object} props
 * @param {number} props.uuid The unique identifier for this component.
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {boolean} props.disableTooltip Should the tooltip be disabled?
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title An override value for the component title.
 */
export default function ScatterplotSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    removeGridComponent,
    theme,
    disableTooltip = false,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    title: titleOverride,

    // Point size at which we switch to using opacity rather than size to make the points smaller.
    minimumPointDeviceSize = 1.5,
    // Average fill density.
    rho = 0.15,
    // Gamma
    gamma = 2.2,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Get "props" from the coordination space.
  const [{
    dataset,
    embeddingZoom: zoom,
    embeddingTargetX: targetX,
    embeddingTargetY: targetY,
    embeddingTargetZ: targetZ,
    embeddingType: mapping,
    cellFilter,
    cellHighlight,
    geneSelection,
    cellSetSelection,
    cellSetColor,
    cellColorEncoding,
    additionalCellSets,
    embeddingCellSetPolygonsVisible: cellSetPolygonsVisible,
    embeddingCellSetLabelsVisible: cellSetLabelsVisible,
    embeddingCellSetLabelSize: cellSetLabelSize,
    embeddingCellRadius: cellRadius,
  }, {
    setEmbeddingZoom: setZoom,
    setEmbeddingTargetX: setTargetX,
    setEmbeddingTargetY: setTargetY,
    setEmbeddingTargetZ: setTargetZ,
    setCellFilter,
    setCellSetSelection,
    setCellHighlight,
    setCellSetColor,
    setCellColorEncoding,
    setAdditionalCellSets,
    setEmbeddingCellSetPolygonsVisible: setCellSetPolygonsVisible,
    setEmbeddingCellSetLabelsVisible: setCellSetLabelsVisible,
    setEmbeddingCellSetLabelSize: setCellSetLabelSize,
    setEmbeddingCellRadius: setCellRadius,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.scatterplot, coordinationScopes);

  const [urls, addUrl, resetUrls] = useUrls();
  const [width, height, deckRef] = useDeckCanvasSize();
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    SCATTERPLOT_DATA_TYPES,
  );

  const title = titleOverride || `Scatterplot (${mapping})`;

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells, cellsCount] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [cellSets] = useCellSetsData(
    loaders,
    dataset,
    setItemIsReady,
    addUrl,
    false,
    { setCellSetSelection, setCellSetColor },
    { cellSetSelection, cellSetColor },
  );
  const [expressionData] = useGeneSelection(
    loaders, dataset, setItemIsReady, false, geneSelection,
  );
  const [attrs] = useExpressionAttrs(
    loaders, dataset, setItemIsReady, addUrl, false,
  );
  const [cellRadiusScale, setCellRadiusScale] = useState(1.0);
  const [cellOpacityScale, setCellOpacityScale] = useState(0.5);

  const mergedCellSets = useMemo(() => mergeCellSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  const setCellSelectionProp = useCallback((v) => {
    setCellSelection(
      v, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
    );
  }, [additionalCellSets, cellSetColor, setCellColorEncoding,
    setAdditionalCellSets, setCellSetColor, setCellSetSelection]);

  const cellColors = useMemo(() => getCellColors({
    cellColorEncoding,
    expressionData: expressionData && expressionData[0],
    geneSelection,
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
    expressionDataAttrs: attrs,
  }), [cellColorEncoding, geneSelection, mergedCellSets,
    cellSetSelection, cellSetColor, expressionData, attrs]);

  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [cellSetPolygonCache, setCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const cellSetPolygons = useMemo(() => {
    if ((cellSetLabelsVisible || cellSetPolygonsVisible)
      && !cacheHas(cellSetPolygonCache, cellSetSelection)
      && mergedCellSets?.tree?.length
      && Object.values(cells).length
      && cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        cells,
        mapping,
        cellSets: mergedCellSets,
        cellSetSelection,
        cellSetColor,
      });
      setCellSetPolygonCache(cache => [...cache, [cellSetSelection, newCellSetPolygons]]);
      return newCellSetPolygons;
    }
    return cacheGet(cellSetPolygonCache, cellSetSelection) || [];
  }, [cellSetPolygonsVisible, cellSetPolygonCache, cellSetLabelsVisible,
    cells, mapping, mergedCellSets, cellSetSelection, cellSetColor]);


  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  const [xRange, yRange, xExtent, yExtent, numCells] = useMemo(() => {
    const cellValues = cells && Object.values(cells);
    if (cellValues?.length) {
      const cellCoordinates = Object.values(cells)
        .map(c => c.mappings[mapping]);
      const xExtent = extent(cellCoordinates, c => c[0]);
      const yExtent = extent(cellCoordinates, c => c[1]);
      const xRange = xExtent[1] - xExtent[0];
      const yRange = yExtent[1] - yExtent[0];
      return [xRange, yRange, xExtent, yExtent, cellValues.length];
    }
    return [null, null, null, null, null];
  }, [cells, mapping]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if(yRange) {

      function getPointSizeDevicePixels(devicePixelRatio, zoom, yRange, height) {
        // Size of a point, in units of the Y axis.
        const pointYAxisSize = 0.001;
        // Point size minimum, in screen pixels.
        const pointScreenSizeMin = 1 / devicePixelRatio;
        // Point size maximum, in screen pixels.
        const pointScreenSizeMax = 10;
        const pixelRatio = 1;

        const scaleFactor = 2 ** zoom;
        const yAxisRange = 2.0 / ((yRange * scaleFactor) / height);

        // The height as a fraction of the current y range, then converted to device pixels
        const heightFraction = pointYAxisSize / yAxisRange;
        const deviceSize = heightFraction * height;

        const pointSizeDevicePixels = clamp(
          deviceSize,
          pointScreenSizeMin * pixelRatio,
          pointScreenSizeMax * pixelRatio
        );
        return pointSizeDevicePixels;
      }
      
      const pointSizeDevicePixels = getPointSizeDevicePixels(window.devicePixelRatio, zoom, yRange, height);
      setCellRadiusScale(pointSizeDevicePixels);

      // Point size.
      const p = pointSizeDevicePixels;

      const aspectRatio = width / height;

      // Compute the plot's x and y range from the view matrix, though these could come from any source
      const scaleFactor = 2 ** zoom;
      const X = 2.0 / ((xRange * scaleFactor) / width);
      const Y = 2.0 / ((yRange * scaleFactor) / height);
      const X0 = 25 * aspectRatio;
      const Y0 = 25;

      

      // Viewport size, in device pixels
      const W = width;
      const H = height;

      // Number of points
      const N = numCells;

      let alpha = ((rho * H * H) / (N * p * p)) * (X0 / X) * (Y0 / Y);

      // Points are circles, so only (pi r^2) of the unit square is filled so we
      // slightly increase the alpha accordingly.
      alpha *=  1.0 / (0.25 * Math.PI);

      // If the pixels shrink below the minimum permitted size, then we adjust the opacity instead
      // and apply clamping of the point size in the vertex shader. Note that we add 0.5 since we
      // slightly inrease the size of points during rendering to accommodate SDF-style antialiasing.
      const clampedPointDeviceSize = Math.max(minimumPointDeviceSize, p);

      // We square this since we're concerned with the ratio of *areas*.
      alpha *= Math.pow(p / clampedPointDeviceSize, 2.0);

      // And finally, we clamp to the range [0, 1]. We should really clamp this to 1 / precision
      // on the low end, depending on the data type of the destination so that we never render *nothing*.
      const nextCellOpacityScale = clamp(alpha, 0.0, 1.0);

      setCellOpacityScale(nextCellOpacityScale);

      console.log(pointSizeDevicePixels, nextCellOpacityScale);
      
      if (typeof targetX !== 'number' || typeof targetY !== 'number') {
        const newTargetX = xExtent[0] + xRange / 2;
        const newTargetY = yExtent[0] + yRange / 2;
        const newZoom = Math.log2(Math.min(width / xRange, height / yRange));
        setTargetX(newTargetX);
        // Graphics rendering has the y-axis going south so we need to multiply by negative one.
        setTargetY(-newTargetY);
        setZoom(newZoom);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xRange, yRange, xExtent, yExtent, numCells, cells, mapping, width, height, zoom]);

  const getCellInfo = useCallback((cellId) => {
    const cellInfo = cells[cellId];
    return {
      [`${capitalize(observationsLabel)} ID`]: cellId,
      ...(cellInfo ? cellInfo.factors : {}),
    };
  }, [cells, observationsLabel]);

  return (
    <TitleInfo
      title={title}
      info={`${cellsCount} ${pluralize(observationsLabel, observationsPluralLabel, cellsCount)}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      options={(
        <ScatterplotOptions
          observationsLabel={observationsLabel}
          cellRadius={cellRadius}
          setCellRadius={setCellRadius}
          cellSetLabelsVisible={cellSetLabelsVisible}
          setCellSetLabelsVisible={setCellSetLabelsVisible}
          cellSetLabelSize={cellSetLabelSize}
          setCellSetLabelSize={setCellSetLabelSize}
          cellSetPolygonsVisible={cellSetPolygonsVisible}
          setCellSetPolygonsVisible={setCellSetPolygonsVisible}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
        />
      )}
    >
      <Scatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={({ zoom: newZoom, target }) => {
          setZoom(newZoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
          setTargetZ(target[2]);
        }}
        cells={cells}
        mapping={mapping}
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        cellColors={cellColors}
        cellSetPolygons={cellSetPolygons}
        cellSetLabelSize={cellSetLabelSize}
        cellSetLabelsVisible={cellSetLabelsVisible}
        cellSetPolygonsVisible={cellSetPolygonsVisible}
        setCellFilter={setCellFilter}
        setCellSelection={setCellSelectionProp}
        setCellHighlight={setCellHighlight}

        cellRadiusScale={cellRadiusScale}
        cellOpacityScale={cellOpacityScale}

        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
      />
      {!disableTooltip && (
      <ScatterplotTooltipSubscriber
        parentUuid={uuid}
        cellHighlight={cellHighlight}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
      />
      )}
    </TitleInfo>
  );
}
