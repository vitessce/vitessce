import React, { useMemo, useCallback } from 'react';
import { isEqual } from 'lodash-es';
import clsx from 'clsx';
import { makeStyles } from '@vitessce/styles';
import {
  TitleInfo,
  useReady,
  useCoordination,
  useLoaders,
  useComparisonMetadata,
  useMatchingLoader,
  useColumnNameMapping,
} from '@vitessce/vit-s';
import { ViewType, DataType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';

const useStyles = makeStyles()(() => ({
  selectedPair: {
    fontWeight: 'bold',
  },
  pairUl: {
    paddingLeft: '15px',
    marginTop: 0,
    fontSize: '12px',
    '& button': {
      fontSize: '12px',
    },
  },
}));

export function SampleSetPairManagerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Sample Sets',
    closeButtonVisible,
    helpText = ViewHelpMapping.SAMPLE_SET_PAIR_MANAGER,
  } = props;

  const { classes } = useStyles();
  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    sampleType,
    sampleSetSelection,
  }, {
    setSampleSetSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SAMPLE_SET_PAIR_MANAGER],
    coordinationScopes,
  );

  const sampleSetsLoader = useMatchingLoader(
    loaders, dataset, DataType.SAMPLE_SETS, { sampleType },
  );
  const sampleSetsColumnNameMappingReversed = useColumnNameMapping(sampleSetsLoader, true);

  const [{ comparisonMetadata }, cmpMetadataStatus] = useComparisonMetadata(
    loaders, dataset, false, {}, {}, { obsType, sampleType },
  );

  const isReady = useReady([
    cmpMetadataStatus,
  ]);

  const stratificationOptions = useMemo(() => {
    /*
      return array of objects like {
        stratificationId: 'aki-vs-hr',
        name: 'Acute kidney injury (AKI) vs. Healthy reference',
        stratificationType: 'sampleSet',
        sampleSets: [
          ['Disease Type', 'AKI'],
          ['Disease Type', 'Reference'],
        ],
      },
    */
    if (comparisonMetadata?.sample_group_pairs) {
      return comparisonMetadata.sample_group_pairs.map((sampleGroupPair) => {
        const [sampleGroupCol, sampleGroupValues] = sampleGroupPair;
        const [sampleGroupCtrl, sampleGroupCase] = sampleGroupValues;
        const groupName = sampleSetsColumnNameMappingReversed?.[sampleGroupCol];
        return {
          stratificationId: `${sampleGroupCol}_${sampleGroupCtrl}-vs-${sampleGroupCase}`,
          name: `${groupName}: ${sampleGroupCtrl} vs. ${sampleGroupCase}`,
          stratificationType: 'sampleSet',
          sampleSets: [
            // With sampleSets coming from the comparison_metadata,
            // need to use loader options from obsSets and sampleSets to get mapping
            // from column name to group name.
            [groupName, sampleGroupCtrl],
            [groupName, sampleGroupCase],
          ],
        };
      });
    }
    return null;
  }, [comparisonMetadata, sampleSetsColumnNameMappingReversed]);

  const onSelectPair = useCallback((sampleSetPair) => {
    setSampleSetSelection(sampleSetPair);
  }, [sampleSetSelection, setSampleSetSelection]);


  return (
    <TitleInfo
      title={title}
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      theme={theme}
      isReady={isReady}
      helpText={helpText}
    >
      <ul className={classes.pairUl}>
        {stratificationOptions?.map((pairObj) => {
          const isSelected = Array.isArray(sampleSetSelection)
            && sampleSetSelection.length === 2
            && (
              isEqual(pairObj.sampleSets, sampleSetSelection)
              || isEqual(pairObj.sampleSets, [sampleSetSelection?.[1], sampleSetSelection?.[0]])
            );
          return (
            <li
              key={pairObj.stratificationId}
              className={clsx({ [classes.selectedPair]: isSelected })}
            >
              {pairObj.name}&nbsp;
              {!isSelected ? (
                <button
                  type="button"
                  onClick={() => onSelectPair(pairObj.sampleSets)}
                >
                  Select
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </TitleInfo>
  );
}
