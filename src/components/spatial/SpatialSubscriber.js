/* eslint-disable */
import React, {
  useState, useCallback, useEffect, useMemo, useRef,
} from 'react';
import PubSub from 'pubsub-js';
import TitleInfo from '../TitleInfo';
import {
  VIEW_INFO,
} from '../../events';
import { capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls, getCellColors } from '../utils';
import Spatial from './Spatial';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber';
import { makeSpatialSubtitle, initializeRasterLayersAndChannels } from './utils';
import { DEFAULT_MOLECULES_LAYER, DEFAULT_CELLS_LAYER } from './constants';

import { useCoordination } from '../../app/state/hooks';
import { componentCoordinationTypes } from '../../app/state/coordination';

export default function SpatialSubscriber(props) {
  const {
    uid,
    loaders,
    coordinationScopes,
    removeGridComponent,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    subobservationsPluralLabelOverride: subobservationsPluralLabel = `${subobservationsLabel}s`,
    theme,
    disableTooltip = false,
  } = props;
  // Create a UUID so that hover events
  // know from which DeckGL element they were generated.
  const uuid = uid;

  const [{
    dataset,
    spatialZoom: zoom,
    spatialTargetX: targetX,
    spatialTargetY: targetY,
    spatialTargetZ: targetZ,
    spatialLayers: layers,
    cellFilter,
    cellSelection,
    cellHighlight,
    geneSelection,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialLayers: setLayers,
    setCellFilter,
    setCellSelection,
    setCellHighlight,
  }] = useCoordination(componentCoordinationTypes.spatial, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    ['cells', 'molecules', 'raster', 'cell-sets', 'expression-matrix'],
  );
  const [urls, addUrl, resetUrls] = useUrls();
  const [width, height, deckRef] = useDeckCanvasSize();

  const [cells, setCells] = useState();
  const [cellsCount, setCellsCount] = useState(0);
  const [cellSets, setCellSets] = useState();
  const [molecules, setMolecules] = useState();
  const [neighborhoods, setNeighborhoods] = useState();
  const [expressionMatrix, setExpressionMatrix] = useState();

  const [autoLayers, setAutoLayers] = useState([]);
  
  const [raster, setRaster] = useState();
  // Since we want the image layer / channel definitions to come from the
  // coordination space stored as JSON in the view config,
  // we need to set up a separate state variable here to store the
  // non-JSON objects, such as layer loader instances.
  const [imageLayerLoaders, setImageLayerLoaders] = useState({});

  useEffect(() => {
    resetUrls();
    resetReadyItems();

    if(!loaders[dataset]) {
      return;
    }

    if(loaders[dataset].loaders['molecules']) {
      loaders[dataset].loaders['molecules'].load().then(({ data, url }) => {
        setMolecules(data);
        addUrl(url, 'Molecules');
        setAutoLayers(prev => ([...prev, DEFAULT_MOLECULES_LAYER]));
        setItemIsReady('molecules');
      });
    } else {
      // There was no molecules loader for this dataset,
      // and molecules should be optional.
      setMolecules(null);
      setItemIsReady('molecules');
    }
    
    if(loaders[dataset].loaders['neighborhoods']) {
      loaders[dataset].loaders['neighborhoods'].load().then(({ data, url }) => {
        setNeighborhoods(data);
        addUrl(url, 'Neighborhoods');
        // TODO: set up a neighborhoods default layer and add to autoLayers.
        setItemIsReady('neighborhoods');
      });
    } else {
      // There was no neighboorhoods loader for this dataset,
      // and neighboorhoods should be optional.
      setNeighborhoods(null);
      setItemIsReady('neighborhoods');
    }

    if(loaders[dataset].loaders['cells']) {
      loaders[dataset].loaders['cells'].load().then(({ data, url }) => {
        setCells(data);
        setCellsCount(Object.keys(data).length);
        addUrl(url, 'Cells');
        setAutoLayers(prev => ([...prev, DEFAULT_CELLS_LAYER]));
        setItemIsReady('cells');
      });
    } else {
      // There was no cells loader for this dataset,
      // and cells should be optional.
      setCells(null);
      setItemIsReady('cells');
    }

    if(loaders[dataset].loaders['cell-sets']) {
      loaders[dataset].loaders['cell-sets'].load().then(({ data, url }) => {
        setCellSets(data);
        addUrl(url, 'Cell Sets');
        setItemIsReady('cell-sets');
      });
    } else {
      // There was no cell sets loader for this dataset,
      // and cell sets should be optional.
      setCellSets(null);
      setItemIsReady('cell-sets');
    }

    if(loaders[dataset].loaders['expression-matrix']) {
      loaders[dataset].loaders['expression-matrix'].load().then(({ data, url }) => {
        const [attrs, arr] = data;
        setExpressionMatrix({
          cols: attrs.cols,
          rows: attrs.rows,
          matrix: arr.data,
        });
        addUrl(url, 'Expression Matrix');
        setItemIsReady('expression-matrix');
      });
    } else {
      // If no expression matrix loader was provided,
      // just clear the expression matrix state.
      setExpressionMatrix(null);
      // Expression matrix is optional for scatterplot.
      setItemIsReady('expression-matrix')
    }

    if(loaders[dataset].loaders['raster']) {
      loaders[dataset].loaders['raster'].load().then(({ data, urls }) => {
        setRaster(data);
        urls.forEach(([url, name]) => {
          addUrl(url, name);
        });
        
        const { layers: rasterLayers, renderLayers: rasterRenderLayers } = data;
        initializeRasterLayersAndChannels(rasterLayers, rasterRenderLayers)
          .then(([autoImageLayers, nextImageLoaders]) => {
            setImageLayerLoaders(nextImageLoaders);
            // `autoImageLayers` will be an array of automatically-initialized image layers.
            setAutoLayers(prev => ([...prev, ...autoImageLayers]));
            setItemIsReady('raster');
          });
      });
    } else {
      // There was no raster loader for this dataset,
      // and raster should be optional.
      setImageLayerLoaders({});
      setItemIsReady('raster');
    }
  }, [loaders, dataset]);

  // Try to set up the layers array automatically if null or undefined.
  useEffect(() => {
    if(isReady && !layers) {
      // TODO: sort the default/automatic layers by type (raster, cell, molecules).
      setLayers(autoLayers);
    }
  }, [autoLayers, isReady, layers, setLayers]);

  const cellColors = useMemo(() => {
    return getCellColors({
      expressionMatrix,
      geneSelection,
      cellColorEncoding: 'geneSelection',
      // TODO: cell sets
    })
  }, [geneSelection]);

  const [moleculesCount, locationsCount] = useMemo(() => {
    if (!molecules) return [0, 0];
    return [
      Object.keys(molecules).length,
      Object.values(molecules)
        .map(l => l.length)
        .reduce((a, b) => a + b, 0),
    ];
  }, [molecules]);

  const updateViewInfo = useCallback(
    viewInfo => PubSub.publish(VIEW_INFO, viewInfo),
    [],
  );

  const getCellInfo = (cellId) => {
    const cell = cells[cellId]
    if(cell) {
      return {
        [`${capitalize(observationsLabel)} ID`]: cellId,
        ...cell.factors,
      };
    }
  };

  const subtitle = makeSpatialSubtitle({
    observationsCount: cellsCount,
    observationsLabel,
    observationsPluralLabel,
    subobservationsCount: moleculesCount,
    subobservationsLabel,
    subobservationsPluralLabel,
    locationsCount,
  });
  return (
    <TitleInfo
      title="Spatial"
      info={subtitle}
      isSpatial
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <Spatial
        ref={deckRef}
        uuid={uuid}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={({ zoom, target }) => {
          setZoom(zoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
          setTargetZ(target[2]);
        }}
        layers={layers}
        cells={cells}
        
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}

        cellColors={cellColors}

        setCellFilter={setCellFilter}
        setCellSelection={setCellSelection}
        setCellHighlight={setCellHighlight}

        molecules={molecules}
        neighborhoods={neighborhoods}
        imageLayerLoaders={imageLayerLoaders}
        
        updateViewInfo={updateViewInfo}
      />
      {!disableTooltip && (
      <SpatialTooltipSubscriber
        uuid={uuid}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
        coordinationScopes={coordinationScopes}
      />
      )}
    </TitleInfo>
  );
}

SpatialSubscriber.defaultProps = {
  cellRadius: 50,
  moleculeRadius: 10,
};
