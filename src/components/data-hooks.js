/* eslint-disable */
import { useState, useEffect } from 'react';
import { warn } from './utils';
import { initializeRasterLayersAndChannels } from './spatial/utils';
import { LoaderNotFoundError } from '../loaders/errors';

/**
 * Get data from a cells data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {(function|null)} onLoad An extra function to execute upon load of the data.
 * @returns {array} [cells, cellsCount] where
 * cells is an object and cellsCount is the
 * number of items in the cells object.
 */
export function useCellsData(loaders, dataset, setItemIsReady, addUrl, isRequired, onLoad = null) {
  const [cells, setCells] = useState({});
  const [cellsCount, setCellsCount] = useState(0);

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders.cells) {
      loaders[dataset].loaders.cells.load().catch(warn).then(({ data, url }) => {
        setCells(data);
        setCellsCount(Object.keys(data).length);
        addUrl(url, 'Cells');
        if (onLoad) {
          onLoad();
        }
        setItemIsReady('cells');
      });
    } else {
      setCells({});
      setCellsCount(0);
      if (isRequired) {
        console.warn('Cells data type required but no loader was found.');
      } else {
        setItemIsReady('cells');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [cells, cellsCount];
}

/**
 * Get data from a cell sets data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @returns {array} [cellSets] where
 * cellSets is a sets tree object.
 */
export function useCellSetsData(loaders, dataset, setItemIsReady, addUrl, isRequired, onLoad = null) {
  const [cellSets, setCellSets] = useState();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders['cell-sets']) {
      // Load the data initially.
      loaders[dataset].loaders['cell-sets'].load().catch(warn).then((payload) => {
        const { data, url } = payload || {};
        setCellSets(data);
        addUrl(url, 'Cell Sets');
        if (onLoad) {
          onLoad(data);
        }
        setItemIsReady('cell-sets');
      });
      // Subscribe to data updates.
      loaders[dataset].loaders['cell-sets'].subscribe((msg, data) => {
        setCellSets(data);
      });
    } else {
      setCellSets(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'cell-sets', null, null));
      } else {
        setItemIsReady('cell-sets');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [cellSets];
}

/**
 * Get data from an expression matrix data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @returns {array} [expressionMatrix] where
 * expressionMatrix is an object with
 * shape { cols, rows, matrix }.
 */
export function useExpressionMatrixData(loaders, dataset, setItemIsReady, addUrl, isRequired) {
  const [expressionMatrix, setExpressionMatrix] = useState();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders['expression-matrix']) {
      loaders[dataset].loaders['expression-matrix'].load().catch(warn).then(({ data, url }) => {
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
      setExpressionMatrix(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'expression-matrix', null, null));
      } else {
        setItemIsReady('expression-matrix');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [expressionMatrix];
}

/**
 * Get data from a molecules data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {(function|null)} onLoad An extra function to execute upon load of the data.
 * @returns {array} [molecules, moleculesCount, locationsCount] where
 * molecules is an object,
 * moleculesCount is the number of unique molecule types, and
 * locationsCount is the number of molecules.
 */
export function useMoleculesData(
  loaders, dataset, setItemIsReady, addUrl, isRequired, onLoad = null,
) {
  const [molecules, setMolecules] = useState();
  const [moleculesCount, setMoleculesCount] = useState(0);
  const [locationsCount, setLocationsCount] = useState(0);

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders.molecules) {
      loaders[dataset].loaders.molecules.load().catch(warn).then(({ data, url }) => {
        setMolecules(data);
        setMoleculesCount(Object.keys(data).length);
        setLocationsCount(Object.values(data)
          .map(l => l.length)
          .reduce((a, b) => a + b, 0));
        addUrl(url, 'Molecules');
        if (onLoad) {
          onLoad();
        }
        setItemIsReady('molecules');
      });
    } else {
      setMolecules({});
      setMoleculesCount(0);
      setLocationsCount(0);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'molecules', null, null));
      } else {
        setItemIsReady('molecules');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [molecules, moleculesCount, locationsCount];
}

/**
 * Get data from a neighborhoods data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {(function|null)} onLoad An extra function to execute upon load of the data.
 * @returns {array} [neighborhoods] where
 * neighborhoods is an object.
 */
export function useNeighborhoodsData(
  loaders, dataset, setItemIsReady, addUrl, isRequired, onLoad = null,
) {
  const [neighborhoods, setNeighborhoods] = useState({});

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders.neighborhoods) {
      loaders[dataset].loaders.neighborhoods.load().then(({ data, url }) => {
        setNeighborhoods(data);
        addUrl(url, 'Neighborhoods');
        if (onLoad) {
          onLoad();
        }
        setItemIsReady('neighborhoods');
      });
    } else {
      setNeighborhoods(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'neighborhoods', null, null));
      } else {
        setItemIsReady('neighborhoods');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [neighborhoods];
}

/**
 * Get data from a raster data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {function} addUrl A function to call to update
 * the URL list.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {(function|null)} onLoad An extra function to execute upon load of the data.
 * @returns {array} [raster, imageLayerLoaders, imageLayerMeta] where
 * raster is an object,
 * imageLayerLoaders is an object, and
 * imageLayerMeta is an object.
 */
export function useRasterData(loaders, dataset, setItemIsReady, addUrl, isRequired, onLoad = null) {
  const [raster, setRaster] = useState();
  // Since we want the image layer / channel definitions to come from the
  // coordination space stored as JSON in the view config,
  // we need to set up a separate state variable here to store the
  // non-JSON objects, such as layer loader instances.
  const [imageLayerLoaders, setImageLayerLoaders] = useState({});
  const [imageLayerMeta, setImageLayerMeta] = useState({});

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders.raster) {
      loaders[dataset].loaders.raster.load().then(({ data, urls }) => {
        setRaster(data);
        urls.forEach(([url, name]) => {
          addUrl(url, name);
        });

        const { layers: rasterLayers, renderLayers: rasterRenderLayers } = data;
        initializeRasterLayersAndChannels(rasterLayers, rasterRenderLayers)
          .then(([autoImageLayers, nextImageLoaders, nextImageMeta]) => {
            setImageLayerLoaders(nextImageLoaders);
            setImageLayerMeta(nextImageMeta);
            if (onLoad) {
              onLoad(autoImageLayers);
            }
            setItemIsReady('raster');
          });
      });
    } else {
      // There was no raster loader for this dataset,
      // and raster should be optional.
      setImageLayerLoaders({});
      setImageLayerMeta({});
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'raster', null, null));
      } else {
        setItemIsReady('raster');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [raster, imageLayerLoaders, imageLayerMeta];
}
