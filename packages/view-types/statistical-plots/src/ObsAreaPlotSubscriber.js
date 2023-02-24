import React, { useMemo } from 'react';
import {
  TitleInfo,
  useCoordination, useLoaders,
  useUrls, useReady, useGridItemSize,
  useObsSetsData,
  registerPluginViewType,
  useMultiCoordinationScopes,
  useMultiCoordinationValues,
  useMultiFeatureSelection,
  useFeatureSelection,
} from '@vitessce/vit-s';
import { ViewType, CoordinationType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { mergeObsSets, treeToSetSizesBySetNames } from '@vitessce/sets-utils';
import { capitalize } from '@vitessce/utils';
import ObsAreaPlot from './ObsAreaPlot';
import { useStyles } from './styles';

const ciFeatures = ['Cortical Area', 'Cortical Interstitial Area'];
const iftaFeatures = ['IFTA Area'];

export function ObsAreaPlotSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title: titleOverride,
  } = props;

  const classes = useStyles();
  const loaders = useLoaders();

  const [{
    dataset,
    featureType,
    featureValueType,
    spatialLayerVisible,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_DENSITY],
    coordinationScopes,
  );

  const obsTypeScopes = useMultiCoordinationScopes(
    CoordinationType.OBS_TYPE,
    coordinationScopes,
  );
  const obsTypeValues = useMultiCoordinationValues(
    CoordinationType.OBS_TYPE,
    coordinationScopes,
  );

  const numeratorObsType = obsTypeValues?.[obsTypeScopes?.[0]];
  const denominatorObsType = obsTypeValues?.[obsTypeScopes?.[1]];


  const title = titleOverride || `Area of ${numeratorObsType}`;

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl] = useUrls(loaders, dataset);

  const [iftaData, loadedIftaSelection, iftaSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, iftaFeatures,
    { obsType: numeratorObsType, featureType, featureValueType },
  );
  const [ciData, loadedCiSelection, ciSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, ciFeatures,
    { obsType: denominatorObsType, featureType, featureValueType },
  );
  
  
  const isReady = useReady([
    ciSelectionStatus,
    iftaSelectionStatus,
  ]);

  const processedData = useMemo(() => {
    if (ciData && iftaData) {
      const corticalArea = ciData[loadedCiSelection.indexOf("Cortical Area")][0];
      const corticalInterstitialArea = ciData[loadedCiSelection.indexOf("Cortical Interstitial Area")][0];
      const iftaArea = iftaData[loadedIftaSelection.indexOf("IFTA Area")][0];
      return [
        {
          area: corticalArea,
          group: 'Total Cortex',
        },
        {
          area: iftaArea,
          group: 'Cortical IFTA',
        },
        {
          area: (corticalArea - iftaArea),
          group: 'Cortical non-IFTA',
        },
      ];
    }
    return null;
  }, [ciData, iftaData,
    loadedCiSelection, loadedIftaSelection,
  ]);

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <div ref={containerRef} className={classes.vegaContainer}>
        {spatialLayerVisible ? (
          <ObsAreaPlot
            data={processedData}
            theme={theme}
            width={width}
            height={height}
          />
        ) : null}
      </div>
    </TitleInfo>
  );
}

export function register() {
  registerPluginViewType(
    ViewType.OBS_AREA,
    ObsAreaPlotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_AREA],
  );
}
