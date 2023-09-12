import { useMemo } from 'react';
import { CoordinationType } from '@vitessce/constants-internal';
import { fromEntries } from '@vitessce/utils';
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
  const selections = useMemo(() => fromEntries(Object.entries(featureSelectionCoordination[0])
    .map(([layerScope, layerVal]) => ([
      layerScope,
      fromEntries(
        Object.entries(layerVal)
          .map(([cScope, cVal]) => ([cScope, cVal.featureSelection])),
      ),
    ]))),
  // Need to execute this more frequently, whenever the featureSelections update.
  [coordinationScopes, coordinationScopesBy,
    ...Object.values(featureSelectionCoordination[0] || {})
      .flatMap(layerVal => Object.values(layerVal).map(cVal => cVal.featureSelection)),
  ]);
  const [
    featureData, loadedSelections, extents, normData, featureStatus,
  ] = useFeatureSelectionMultiLevel(
    loaders, dataset, false, matchOnObj, selections, 2,
  );
  return [featureData, loadedSelections, extents, normData, featureStatus];
}

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
  const selections = useMemo(() => fromEntries(Object.entries(featureSelectionCoordination[0])
    .map(([layerScope, layerVal]) => ([
      layerScope,
      layerVal.featureSelection,
    ]))),
  // Need to execute this more frequently, whenever the featureSelections update.
  [coordinationScopes, coordinationScopesBy,
    ...Object.values(featureSelectionCoordination[0] || {})
      .flatMap(layerVal => layerVal.featureSelection),
  ]);
  const [
    featureData, loadedSelections, extents, normData, featureStatus,
  ] = useFeatureSelectionMultiLevel(
    loaders, dataset, false, matchOnObj, selections, 1,
  );
  return [featureData, loadedSelections, extents, normData, featureStatus];
}

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
  const [indicesData, indicesDataStatus] = useObsFeatureMatrixIndicesMultiLevel(
    loaders, dataset, false, matchOnObj, 2,
  );
  return [indicesData, indicesDataStatus];
}

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
  const [indicesData, indicesDataStatus] = useObsFeatureMatrixIndicesMultiLevel(
    loaders, dataset, false, matchOnObj, 1,
  );
  return [indicesData, indicesDataStatus];
}

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
  const [indicesData, indicesDataStatus] = useObsLabelsMultiLevel(
    loaders, dataset, false, matchOnObj, 1,
  );
  return [indicesData, indicesDataStatus];
}

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
  const [indicesData, indicesDataStatus] = useObsLocationsMultiLevel(
    loaders, dataset, false, matchOnObj, 2,
  );
  return [indicesData, indicesDataStatus];
}

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
  const [indicesData, indicesDataStatus] = useObsSetsMultiLevel(
    loaders, dataset, false, matchOnObj, 2,
  );
  return [indicesData, indicesDataStatus];
}
