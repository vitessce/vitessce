import { useState, useEffect } from 'react';
import equal from 'fast-deep-equal';
import { capitalize, getEntityTypeKey } from '../utils';
import { useSetWarning } from '../app/state/hooks';
import {
  AbstractLoaderError,
  LoaderNotFoundError,
} from '../loaders/errors/index';
import {
  DEFAULT_MOLECULES_LAYER,
  DEFAULT_CELLS_LAYER,
  DEFAULT_NEIGHBORHOODS_LAYER,
} from './spatial/constants';
import { DataType } from '../app/constants';
import { getDefaultCoordinationValues } from '../app/plugins';

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
 * Initialize values in the coordination space.
 * @param {object} values Object where
 * keys are coordination type names,
 * values are initial coordination values.
 * @param {object} setters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialValues Object where
 * keys are coordination type names and keys are values.
 */
function initCoordinationSpace(values, setters, initialValues) {
  if (!values || !setters) {
    return;
  }
  const defaultCoordinationValues = getDefaultCoordinationValues();
  Object.entries(values).forEach(([coordinationType, value]) => {
    const setterName = `set${capitalize(coordinationType)}`;
    const setterFunc = setters[setterName];
    const initialValue = initialValues && initialValues[coordinationType];
    const shouldInit = equal(initialValue, defaultCoordinationValues[coordinationType]);
    if (shouldInit && setterFunc) {
      setterFunc(value);
    }
  });
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
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [cells, cellsCount] where
 * cells is an object and cellsCount is the
 * number of items in the cells object.
 */
export function useCellsData(
  loaders, dataset, entityTypes, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [cells, setCells] = useState({});
  const [cellsCount, setCellsCount] = useState(0);

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }
    const entityTypeKey = getEntityTypeKey(DataType.OBS, entityTypes);
    const loader = loaders[dataset].loaders[DataType.OBS]?.get(entityTypeKey);
    if (loader) {
      loader.load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, url, coordinationValues } = payload;
        setCells(data);
        setCellsCount(Object.keys(data).length);
        addUrl(url, 'Cells');
        // This dataset has cells, so set up the
        // spatial cells layer coordination value
        // using the cell layer singleton.
        const coordinationValuesOrDefault = {
          spatialObsLayer: DEFAULT_CELLS_LAYER,
          ...coordinationValues,
        };
        initCoordinationSpace(
          coordinationValuesOrDefault,
          coordinationSetters, initialCoordinationValues,
        );
        setItemIsReady(DataType.OBS);
      });
    } else {
      setCells({});
      setCellsCount(0);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.OBS, null, null), setWarning);
      } else {
        setItemIsReady(DataType.OBS);
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
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names and values are the current values.
 * @returns {array} [cellSets] where
 * cellSets is a sets tree object.
 */
export function useCellSetsData(
  loaders, dataset, entityTypes, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [cellSets, setCellSets] = useState();

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }
    const entityTypeKey = getEntityTypeKey(DataType.OBS_SETS, entityTypes);
    const loader = loaders[dataset].loaders[DataType.OBS_SETS]?.get(entityTypeKey);
    if (loader) {
      // Load the data initially.
      loader.load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, url, coordinationValues } = payload;
        setCellSets(data);
        addUrl(url, 'Cell Sets');
        initCoordinationSpace(
          coordinationValues,
          coordinationSetters,
          initialCoordinationValues,
        );
        setItemIsReady(DataType.OBS_SETS);
      });
    } else {
      setCellSets(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.OBS_SETS, null, null), setWarning);
      } else {
        setItemIsReady(DataType.OBS_SETS);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [cellSets];
}

/**
 * Get (potentially filtered) data from an expression matrix data type loader,
 * updating "ready" and URL state appropriately.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.  Should not be used in conjunction (called in the same component)
 * with useExpressionAttrs as this returns a potentially filtered set of attributes
 * specifically for the returned expression data.
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
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [expressionMatrix] where
 * expressionMatrix is an object with
 * shape { cols, rows, matrix }.
 */
export function useExpressionMatrixData(
  loaders, dataset, entityTypes, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [expressionMatrix, setExpressionMatrix] = useState();

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }
    const entityTypeKey = getEntityTypeKey(DataType.OBS_FEATURE_MATRIX, entityTypes);
    const loader = loaders[dataset].loaders[DataType.OBS_FEATURE_MATRIX]?.get(entityTypeKey);
    if (loader) {
      loader.load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, url, coordinationValues } = payload;
        const [attrs, arr] = data;
        setExpressionMatrix({
          cols: attrs.cols,
          rows: attrs.rows,
          matrix: arr.data,
        });
        addUrl(url, 'Expression Matrix');
        initCoordinationSpace(
          coordinationValues,
          coordinationSetters,
          initialCoordinationValues,
        );
        setItemIsReady(DataType.OBS_FEATURE_MATRIX);
      });
    } else {
      setExpressionMatrix(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.OBS_FEATURE_MATRIX, null, null), setWarning);
      } else {
        setItemIsReady(DataType.OBS_FEATURE_MATRIX);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [expressionMatrix];
}

/**
 * Get data from the expression matrix data type loader for a given gene selection.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.
 * @param {object} loaders The object mapping
 * datasets and data types to loader instances.
 * @param {string} dataset The key for a dataset,
 * used to identify which loader to use.
 * @param {function} setItemIsReady A function to call
 * when done loading.
 * @param {boolean} isRequired Should a warning be thrown if
 * loading is unsuccessful?
 * @param {boolean} selection A list of gene names to get expression data for.
 * @returns {array} [geneData] where geneData is an array [Uint8Array, ..., Uint8Array]
 * for however many genes are in the selection.
 */
export function useGeneSelection(
  loaders,
  dataset,
  entityTypes,
  setItemIsReady,
  isRequired,
  selection,
  setItemIsNotReady,
) {
  const [geneData, setGeneData] = useState();

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }
    if (!selection) {
      setItemIsReady(DataType.OBS_FEATURE_MATRIX);
      return;
    }
    const entityTypeKey = getEntityTypeKey(DataType.OBS_FEATURE_MATRIX, entityTypes);
    const loader = loaders[dataset].loaders[DataType.OBS_FEATURE_MATRIX]?.get(entityTypeKey);
    if (loader) {
      setItemIsNotReady(DataType.OBS_FEATURE_MATRIX);
      const implementsGeneSelection = typeof loader.loadGeneSelection === 'function';
      if (implementsGeneSelection) {
        loader
          .loadGeneSelection({ selection })
          .catch(e => warn(e, setWarning))
          .then((payload) => {
            if (!payload) return;
            const { data } = payload;
            setGeneData(data);
            setItemIsReady(DataType.OBS_FEATURE_MATRIX);
          });
      } else {
        loader.load().catch(e => warn(e, setWarning)).then((payload) => {
          if (!payload) return;
          const { data } = payload;
          const [attrs, { data: matrix }] = data;
          const expressionDataForSelection = selection.map((sel) => {
            const geneIndex = attrs.cols.indexOf(sel);
            const numGenes = attrs.cols.length;
            const numCells = attrs.rows.length;
            const expressionData = new Uint8Array(numCells);
            for (let cellIndex = 0; cellIndex < numCells; cellIndex += 1) {
              expressionData[cellIndex] = matrix[cellIndex * numGenes + geneIndex];
            }
            return expressionData;
          });
          setGeneData(expressionDataForSelection);
          setItemIsReady(DataType.OBS_FEATURE_MATRIX);
        });
      }
    } else {
      setGeneData(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.OBS_FEATURE_MATRIX, null, null), setWarning);
      } else {
        setItemIsReady(DataType.OBS_FEATURE_MATRIX);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset, selection]);

  return [geneData];
}

/**
 * Get the attributes for the expression matrix data type loader,
 * i.e names of cells and genes.
 * Throw warnings if the data is marked as required.
 * Subscribe to loader updates.  Should not be used in conjunction (called in the same component)
 * with useExpressionMatrixData.
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
 * @returns {object} [attrs] { rows, cols } object containing cell and gene names.
 */
export function useExpressionAttrs(
  loaders, dataset, entityTypes,
  setItemIsReady, addUrl, isRequired,
) {
  const [attrs, setAttrs] = useState();

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }
    const entityTypeKey = getEntityTypeKey(DataType.OBS_FEATURE_MATRIX, entityTypes);
    const loader = loaders[dataset].loaders[DataType.OBS_FEATURE_MATRIX]?.get(entityTypeKey);
    if (loader) {
      const implementsLoadAttrs = typeof loader.loadAttrs === 'function';
      if (implementsLoadAttrs) {
        loader.loadAttrs().catch(e => warn(e, setWarning)).then((payload) => {
          if (!payload) return;
          const { data, url } = payload;
          setAttrs(data);
          addUrl(url, 'Expression Matrix');
          setItemIsReady(DataType.OBS_FEATURE_MATRIX);
        });
      } else {
        loader.load().catch(e => warn(e, setWarning)).then((payload) => {
          if (!payload) return;
          const { data, url } = payload;
          setAttrs(data[0]);
          addUrl(url, 'Expression Matrix');
          setItemIsReady(DataType.OBS_FEATURE_MATRIX);
        });
      }
    } else {
      setAttrs(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.OBS_FEATURE_MATRIX, null, null), setWarning);
      } else {
        setItemIsReady(DataType.OBS_FEATURE_MATRIX);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [attrs];
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
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [molecules, moleculesCount, locationsCount] where
 * molecules is an object,
 * moleculesCount is the number of unique molecule types, and
 * locationsCount is the number of molecules.
 */
export function useMoleculesData(
  loaders, dataset, entityTypes, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [molecules, setMolecules] = useState();
  const [moleculesCount, setMoleculesCount] = useState(0);
  const [locationsCount, setLocationsCount] = useState(0);

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }
    const entityTypeKey = getEntityTypeKey(DataType.SUB_OBS, entityTypes);
    const loader = loaders[dataset].loaders[DataType.SUB_OBS]?.get(entityTypeKey);
    if (loader) {
      loader.load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, url, coordinationValues } = payload;
        setMolecules(data);
        setMoleculesCount(Object.keys(data).length);
        setLocationsCount(Object.values(data)
          .map(l => l.length)
          .reduce((a, b) => a + b, 0));
        addUrl(url, 'Molecules');
        const coordinationValuesOrDefault = {
          spatialSubObsLayer: DEFAULT_MOLECULES_LAYER,
          ...coordinationValues,
        };
        initCoordinationSpace(
          coordinationValuesOrDefault,
          coordinationSetters,
          initialCoordinationValues,
        );
        setItemIsReady(DataType.SUB_OBS);
      });
    } else {
      setMolecules({});
      setMoleculesCount(0);
      setLocationsCount(0);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.SUB_OBS, null, null), setWarning);
      } else {
        setItemIsReady(DataType.SUB_OBS);
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
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [neighborhoods] where
 * neighborhoods is an object.
 */
export function useNeighborhoodsData(
  loaders, dataset, entityTypes, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [neighborhoods, setNeighborhoods] = useState();

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }
    const entityTypeKey = getEntityTypeKey(DataType.NEIGHBORHOODS, entityTypes);
    const loader = loaders[dataset].loaders[DataType.NEIGHBORHOODS]?.get(entityTypeKey);
    if (loader) {
      loader.load().catch(e => warn(e, setWarning))
        .then((payload) => {
          if (!payload) return;
          const { data, url, coordinationValues } = payload;
          setNeighborhoods(data);
          addUrl(url, 'Neighborhoods');
          const coordinationValuesOrDefault = {
            spatialNeighborhoodsLayer: DEFAULT_NEIGHBORHOODS_LAYER,
            ...coordinationValues,
          };
          initCoordinationSpace(
            coordinationValuesOrDefault,
            coordinationSetters,
            initialCoordinationValues,
          );
          setItemIsReady(DataType.NEIGHBORHOODS);
        });
    } else {
      setNeighborhoods({});
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.NEIGHBORHOODS, null, null), setWarning);
      } else {
        setItemIsReady(DataType.NEIGHBORHOODS);
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
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [raster, imageLayerLoaders, imageLayerMeta] where
 * raster is an object,
 * imageLayerLoaders is an object, and
 * imageLayerMeta is an object.
 */
export function useRasterData(
  loaders, dataset, entityTypes, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
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
    const entityTypeKey = getEntityTypeKey(DataType.RASTER, entityTypes);
    const loader = loaders[dataset].loaders[DataType.RASTER]?.get(entityTypeKey);
    if (loader) {
      loader.load().catch(e => warn(e, setWarning)).then((payload) => {
        if (!payload) return;
        const { data, url: urls, coordinationValues } = payload;
        setRaster(data);
        urls.forEach(([url, name]) => {
          addUrl(url, name);
        });
        const { loaders: nextImageLoaders, meta: nextImageMeta } = data;
        setImageLayerLoaders(nextImageLoaders);
        setImageLayerMeta(nextImageMeta);
        initCoordinationSpace(
          coordinationValues,
          coordinationSetters,
          initialCoordinationValues,
        );
        setItemIsReady(DataType.RASTER);
      });
    } else {
      // There was no raster loader for this dataset,
      // and raster should be optional.
      setImageLayerLoaders([]);
      setImageLayerMeta([]);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.RASTER, null, null), setWarning);
      } else {
        setItemIsReady(DataType.RASTER);
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
 * @param {object} coordinationSetters Object where
 * keys are coordination type names with the prefix 'set',
 * values are coordination setter functions.
 * @param {object} initialCoordinationValues Object where
 * keys are coordination type names with the prefix 'initialize',
 * values are initialization preferences as boolean values.
 * @returns {array} [neighborhoods] where
 * neighborhoods is an object.
 */
export function useGenomicProfilesData(
  loaders, dataset, entityTypes, setItemIsReady, addUrl, isRequired,
  coordinationSetters, initialCoordinationValues,
) {
  const [genomicProfilesAttrs, setGenomicProfilesAttrs] = useState();

  const setWarning = useSetWarning();

  useEffect(() => {
    if (!loaders[dataset]) {
      return;
    }
    const entityTypeKey = getEntityTypeKey(DataType.GENOMIC_PROFILES, entityTypes);
    const loader = loaders[dataset].loaders[DataType.GENOMIC_PROFILES]?.get(entityTypeKey);
    if (loader) {
      loader.load().catch(e => warn(e, setWarning))
        .then((payload) => {
          if (!payload) return;
          const { data, url, coordinationValues } = payload;
          setGenomicProfilesAttrs(data);
          addUrl(url);
          initCoordinationSpace(
            coordinationValues,
            coordinationSetters,
            initialCoordinationValues,
          );
          setItemIsReady(DataType.GENOMIC_PROFILES);
        });
    } else {
      setGenomicProfilesAttrs(null);
      if (isRequired) {
        warn(new LoaderNotFoundError(dataset, DataType.GENOMIC_PROFILES, null, null), setWarning);
      } else {
        setItemIsReady(DataType.GENOMIC_PROFILES);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  return [genomicProfilesAttrs];
}
