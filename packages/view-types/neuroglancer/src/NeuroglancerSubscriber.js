import React, {
  useState, useCallback, useMemo,
} from 'react';
import {
  TitleInfo,

} from '@vitessce/vit-s';
// import { pluralize as plur, capitalize, commaNumber, cleanFeatureId } from '@vitessce/utils';
// import { mergeObsSets, findLongestCommonPath, getCellColors } from '@vitessce/sets-utils';
// import { COMPONENT_COORDINATION_TYPES, ViewType, ViewHelpMapping } from '@vitessce/constants-internal';
import { Neuroglancer } from './Neuroglancer.js';


export function NeuroglancerSubscriber(props) {
  const {
    uuid,
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    observationsLabelOverride,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    theme,
    disableTooltip = false,
    title = 'Neuroglancer',
    bitmaskValueIsIndex = false, // TODO: move to coordination type
    three: threeFor3d = false,
  } = props;

  return (
      <TitleInfo
        title={title}
        isSpatial
      // urls={urls}
        theme={theme}
        closeButtonVisible={closeButtonVisible}
        downloadButtonVisible={downloadButtonVisible}
        removeGridComponent={removeGridComponent}
        isReady
      >
      <Neuroglancer {...props} />
      </TitleInfo>

  );
}
