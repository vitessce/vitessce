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
import { sum } from 'd3-array';
import ObsDensityPlot from './ObsDensityPlot';
import { useStyles } from './styles';

const ciFeatures = ['Cortical Area', 'Cortical Interstitial Area'];
const ptcFeatures = ['Area'];
const ptcGroups = ['PTC in IFTA', 'PTC in Cortex'];
const iftaFeatures = ['IFTA Area'];

export function ObsDensityPlotSubscriber(props) {
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
  const iftaObsType = obsTypeValues?.[obsTypeScopes?.[2]];


  const title = titleOverride || `Density of ${numeratorObsType}`;

  const [width, height, containerRef] = useGridItemSize();
  const [urls, addUrl] = useUrls(loaders, dataset);

  const [ciData, loadedCiSelection, ciSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, ciFeatures,
    { obsType: denominatorObsType, featureType, featureValueType },
  );
  const [ptcData, loadedPtcSelection, ptcSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, ptcFeatures,
    { obsType: numeratorObsType, featureType, featureValueType },
  );
  const [ptcGroupData, loadedPtcGroupSelection, ptcGroupSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, ptcGroups,
    { obsType: numeratorObsType, featureType, featureValueType },
  );
  const [iftaData, loadedIftaSelection, iftaSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, iftaFeatures,
    { obsType: iftaObsType, featureType, featureValueType },
  );
  
  const isReady = useReady([
    ciSelectionStatus,
    ptcSelectionStatus,
    ptcGroupSelectionStatus,
    iftaSelectionStatus,
  ]);

  const processedData = useMemo(() => {
    if (ciData && ptcData && ptcGroupData && iftaData) {
      const corticalArea = ciData[loadedCiSelection.indexOf("Cortical Area")][0];
      const areaArr = Array.from(ptcData[loadedPtcSelection.indexOf("Area")]);
      if (numeratorObsType === 'Peritubular Capillaries') {
        const corticalInterstitialArea = ciData[loadedCiSelection.indexOf("Cortical Interstitial Area")][0];
        const iftaArea = iftaData[loadedIftaSelection.indexOf("IFTA Area")][0];

        const inIftaFlags = ptcGroupData[loadedPtcGroupSelection.indexOf("PTC in IFTA")];
        const inCortexFlags = ptcGroupData[loadedPtcGroupSelection.indexOf("PTC in Cortex")];

        const ptcAreaTotal = sum(areaArr);
        const ptcAreaInIfta = sum(areaArr.filter((d, i) => inIftaFlags[i]));
        const ptcAreaInCortex = sum(areaArr.filter((d, i) => inCortexFlags[i]));
        const ptcAreaInNonIftaCortex = sum(areaArr.filter((d, i) => inCortexFlags[i] && !inIftaFlags[i]));
        return [
          {
            density: ptcAreaInCortex / corticalArea,
            group: 'Total Cortex',
          },
          {
            density: ptcAreaInIfta / iftaArea,
            group: 'Cortical IFTA',
          },
          {
            density: ptcAreaInNonIftaCortex / (corticalArea - iftaArea),
            group: 'Cortical non-IFTA',
          },
        ];
      } else if (numeratorObsType === 'Tubules') {
        const tubuleAreaTotal = sum(areaArr);
        return [
          {
            density: tubuleAreaTotal / corticalArea,
            group: 'Total Cortex',
          },
        ]
      } else {
        return [];
      }
    }
    return null;
  }, [ciData, ptcData, ptcGroupData, iftaData, numeratorObsType,
    loadedCiSelection, loadedPtcSelection, loadedPtcGroupSelection, loadedIftaSelection,
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
          <ObsDensityPlot
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
    ViewType.OBS_DENSITY,
    ObsDensityPlotSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.OBS_DENSITY],
  );
}
