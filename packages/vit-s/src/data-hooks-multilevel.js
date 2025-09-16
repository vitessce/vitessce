import { useMemo } from 'react';
import { CoordinationType } from '@vitessce/constants-internal';
import {
  useComplexCoordination,
  useComplexCoordinationSecondary,
} from './state/hooks.js';
import {
  useFeatureSelectionMultiLevel,
  useObsFeatureMatrixIndicesMultiLevel,
  useObsLocationsMultiLevel,
  useObsSetsMultiLevel,
  useObsLabelsMultiLevel,
} from './data-hooks-multilevel-utils.js';


/**
 * Wrapper around useFeatureSelectionMultiLevel.
 * @param {object} coordinationScopes
 * @param {object} coordinationScopesBy
 * @param {object} loaders
 * @param {string} dataset
 * @returns {array} [featureData, loadedSelections, extents, normData, featureStatus, errors]
 */
export function useSegmentationMultiFeatureSelection(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsFeatureMatrixCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.FEATURE_TYPE,
      CoordinationType.FEATURE_VALUE_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );
  const featureSelectionCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.FEATURE_SELECTION,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );
  const matchOnObj = useMemo(() => obsFeatureMatrixCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const useMemoDependency = Object.values(featureSelectionCoordination[0] || {})
    .flatMap(layerVal => Object.values(layerVal).map(cVal => cVal.featureSelection));
  const selections = useMemo(() => Object.fromEntries(
    Object.entries(featureSelectionCoordination[0])
      .map(([layerScope, layerVal]) => ([
        layerScope,
        Object.fromEntries(
          Object.entries(layerVal)
            .map(([cScope, cVal]) => ([cScope, cVal.featureSelection])),
        ),
      ])),
  ),
  // Need to execute this more frequently, whenever the featureSelections update.
  [coordinationScopes, coordinationScopesBy,
    // We need to ensure there are always the same number of
    // entries in the full dependency array.
    JSON.stringify(useMemoDependency.length > 0 ? useMemoDependency : [null]),
  ]);
  const [
    featureData, loadedSelections, extents, normData, featureStatus, errors,
  ] = useFeatureSelectionMultiLevel(
    loaders, dataset, false, matchOnObj, selections, 2,
  );
  return [featureData, loadedSelections, extents, normData, featureStatus, errors];
}

/**
 * Wrapper around useFeatureSelectionMultiLevel.
 * @param {object} coordinationScopes
 * @param {object} coordinationScopesBy
 * @param {object} loaders
 * @param {string} dataset
 * @returns {array} [featureData, loadedSelections, extents, normData, featureStatus, errors]
 */
export function useSpotMultiFeatureSelection(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsFeatureMatrixCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.FEATURE_TYPE,
      CoordinationType.FEATURE_VALUE_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
  );
  const featureSelectionCoordination = useComplexCoordination(
    [
      CoordinationType.FEATURE_SELECTION,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
  );
  const matchOnObj = useMemo(() => obsFeatureMatrixCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const selections = useMemo(() => Object.fromEntries(
    Object.entries(featureSelectionCoordination[0])
      .map(([layerScope, layerVal]) => ([
        layerScope,
        layerVal.featureSelection,
      ])),
  ),
  // Need to execute this more frequently, whenever the featureSelections update.
  [coordinationScopes, coordinationScopesBy,
    ...Object.values(featureSelectionCoordination[0] || {})
      .flatMap(layerVal => layerVal.featureSelection),
  ]);
  const [
    featureData, loadedSelections, extents, normData, featureStatus, errors,
  ] = useFeatureSelectionMultiLevel(
    loaders, dataset, false, matchOnObj, selections, 1,
  );
  return [featureData, loadedSelections, extents, normData, featureStatus, errors];
}

/**
 * Wrapper around useObsFeatureMatrixIndicesMultiLevel.
 * @param {object} coordinationScopes
 * @param {object} coordinationScopesBy
 * @param {object} loaders
 * @param {string} dataset
 * @returns {array} [indicesData, status, errors]
 */
export function useSegmentationMultiObsFeatureMatrixIndices(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsFeatureMatrixCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.FEATURE_TYPE,
      CoordinationType.FEATURE_VALUE_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );
  const matchOnObj = useMemo(() => obsFeatureMatrixCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [indicesData, indicesDataStatus, indicesDataErrors] = useObsFeatureMatrixIndicesMultiLevel(
    loaders, dataset, false, matchOnObj, 2,
  );
  return [indicesData, indicesDataStatus, indicesDataErrors];
}

/**
 * Wrapper around useObsFeatureMatrixIndicesMultiLevel.
 * @param {object} coordinationScopes
 * @param {object} coordinationScopesBy
 * @param {object} loaders
 * @param {string} dataset
 * @returns {array} [indicesData, status, errors]
 */
export function useSpotMultiObsFeatureMatrixIndices(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsFeatureMatrixCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.FEATURE_TYPE,
      CoordinationType.FEATURE_VALUE_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
  );
  const matchOnObj = useMemo(() => obsFeatureMatrixCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [indicesData, indicesDataStatus, indicesDataErrors] = useObsFeatureMatrixIndicesMultiLevel(
    loaders, dataset, false, matchOnObj, 1,
  );
  return [indicesData, indicesDataStatus, indicesDataErrors];
}

/**
 * Wrapper around useObsLabelsMultiLevel.
 * @param {object} coordinationScopes
 * @param {object} coordinationScopesBy
 * @param {object} loaders
 * @param {string} dataset
 * @returns {array} [data, status, errors]
 */
export function usePointMultiObsLabels(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsLabelsCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.OBS_LABELS_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.POINT_LAYER,
  );
  const matchOnObj = useMemo(() => obsLabelsCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [indicesData, indicesDataStatus, indicesDataErrors] = useObsLabelsMultiLevel(
    loaders, dataset, false, matchOnObj, 1,
  );
  return [indicesData, indicesDataStatus, indicesDataErrors];
}

/**
 * Wrapper around useObsLocationsMultiLevel.
 * @param {object} coordinationScopes
 * @param {object} coordinationScopesBy
 * @param {object} loaders
 * @param {string} dataset
 * @returns {array} [data, status, errors]
 */
export function useSegmentationMultiObsLocations(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsTypeCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.OBS_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );
  const matchOnObj = useMemo(() => obsTypeCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [indicesData, indicesDataStatus, indicesDataErrors] = useObsLocationsMultiLevel(
    loaders, dataset, false, matchOnObj, 2,
  );
  return [indicesData, indicesDataStatus, indicesDataErrors];
}

/**
 * Wrapper around useObsSetsMultiLevel.
 * @param {object} coordinationScopes
 * @param {object} coordinationScopesBy
 * @param {object} loaders
 * @param {string} dataset
 * @returns {array} [data, status, errors]
 */
export function useSegmentationMultiObsSets(
  coordinationScopes, coordinationScopesBy, loaders, dataset,
) {
  const obsTypeCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.OBS_TYPE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );
  const matchOnObj = useMemo(() => obsTypeCoordination[0],
    // imageCoordination reference changes each render,
    // use coordinationScopes and coordinationScopesBy which are
    // indirect dependencies here.
    [coordinationScopes, coordinationScopesBy]);
  const [indicesData, indicesDataStatus, indicesDataErrors] = useObsSetsMultiLevel(
    loaders, dataset, false, matchOnObj, 2,
  );
  return [indicesData, indicesDataStatus, indicesDataErrors];
}
