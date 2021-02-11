import { useState, useEffect } from 'react';
import { useSetWarning } from '../app/state/hooks';
import {
  AbstractLoaderError,
  LoaderNotFoundError,
} from '../loaders/errors/index';
import { initializeRasterLayersAndChannels } from './spatial/utils';

/**
 * Warn via publishing to the console
 * and to the global warning store.
 * @param {AbstractLoaderError} error An error instance.
 */
function warn(error, setWarning) {
  setWarning(error.message);
  console.warn(error.message);
  if (error instanceof AbstractLoaderError) {
    error.warnInConsole();
  }
}

/**
 * Get the dataset description string.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @returns {array} [description] where
 * description is a string.
 */
export function useDescription(loaders, dataset) {
  const [description, setDescription] = useState();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].description) {
      setDescription(loaders[dataset].description);
    } else {
      setDescription(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [description];
}

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

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders.cells) {
      loaders[dataset].loaders.cells.load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, url } = payload;
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
        warn(new LoaderNotFoundError(dataset, 'cells', null, null), setWarning);
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
export function useCellSetsData(
  loaders, dataset, setItemIsReady, addUrl, isRequired, onLoad = null,
) {
  const [cellSets, setCellSets] = useState();

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders['cell-sets']) {
      // Load the data initially.
      loaders[dataset].loaders['cell-sets'].load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, url } = payload;
        setCellSets(data);
        addUrl(url, 'Cell Sets');
        if (onLoad) {
          onLoad(data);
        }
        setItemIsReady('cell-sets');
      });
    } else {
      setCellSets(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'cell-sets', null, null), setWarning);
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

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders['expression-matrix']) {
      loaders[dataset].loaders['expression-matrix'].load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, url } = payload;
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
        warn(new LoaderNotFoundError(dataset, 'expression-matrix', null, null), setWarning);
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

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders.molecules) {
      loaders[dataset].loaders.molecules.load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, url } = payload;
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
        warn(new LoaderNotFoundError(dataset, 'molecules', null, null), setWarning);
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
  const [neighborhoods, setNeighborhoods] = useState();

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders.neighborhoods) {
      loaders[dataset].loaders.neighborhoods.load().catch(e => warn(e, setWarning))
        .then((payload) => {
          if (!payload) return;
          const { data, url } = payload;
          setNeighborhoods(data);
          addUrl(url, 'Neighborhoods');
          if (onLoad) {
            onLoad();
          }
          setItemIsReady('neighborhoods');
        });
    } else {
      setNeighborhoods({});
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'neighborhoods', null, null), setWarning);
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
  const [imageLayerLoaders, setImageLayerLoaders] = useState([]);
  const [imageLayerMeta, setImageLayerMeta] = useState([]);

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders.raster) {
      loaders[dataset].loaders.raster.load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, urls } = payload;
        setRaster(data);
        urls.forEach(([url, name]) => {
          addUrl(url, name);
        });

        const {
          layers: rasterLayers,
          renderLayers:
          rasterRenderLayers,
          usePhysicalSizeScaling,
        } = data;
        initializeRasterLayersAndChannels(rasterLayers, rasterRenderLayers, usePhysicalSizeScaling)
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
      setImageLayerLoaders([]);
      setImageLayerMeta([]);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'raster', null, null), setWarning);
      } else {
        setItemIsReady('raster');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [raster, imageLayerLoaders, imageLayerMeta];
}

/**
 * Get data from a genomic-profiles data type loader,
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
export function useGenomicProfilesData(
  loaders, dataset, setItemIsReady, addUrl, isRequired, onLoad = null,
) {
  const [genomicProfilesAttrs, setGenomicProfilesAttrs] = useState();

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }

    if (loaders[dataset].loaders['genomic-profiles']) {
      loaders[dataset].loaders['genomic-profiles'].load().catch(e => warn(e, setWarning))
        .then((payload) => {
          if (!payload) return;
          const { data, url } = payload;
          setGenomicProfilesAttrs(data);
          addUrl(url);
          if (onLoad) {
            onLoad();
          }
          setItemIsReady('genomic-profiles');
        });
    } else {
      setGenomicProfilesAttrs(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, 'genomic-profiles', null, null), setWarning);
      } else {
        setItemIsReady('genomic-profiles');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [genomicProfilesAttrs];
}
