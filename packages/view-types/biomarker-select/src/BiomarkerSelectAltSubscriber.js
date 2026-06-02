/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useMemo } from 'react';
import {
  useAsyncFunction,
  useViewConfigStoreApi,
  useSetViewConfig,
  useViewConfig,
  useCoordination,
  useLoaders,
  useComparisonMetadata,
  useMatchingLoader,
  useColumnNameMapping,
  useCoordinationScopes,
} from '@vitessce/vit-s';
import { AsyncFunctionType, ViewType, COMPONENT_COORDINATION_TYPES, DataType } from '@vitessce/constants-internal';
import { BiomarkerSelectAlt } from './BiomarkerSelectAlt.js';

/**
 * Alternative biomarker select UI.
 * @param {object} props
 * @param {{ name: string, stratificationType: string, sampleSets: [string[], string[]]}[]} props.stratificationOptions
 * @returns
 */
export function BiomarkerSelectAltSubscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
  } = props;

  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);

  const [{
    dataset,
    obsType,
    sampleType,
    sampleSetFilter,
    sampleSetSelection,
    featureSelection,
  }, {
    setSampleSetFilter,
    setSampleSetSelection,
    setFeatureSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.BIOMARKER_SELECT],
    coordinationScopes,
  );

  const viewConfigStoreApi = useViewConfigStoreApi();
  const viewConfig = useViewConfig();
  const setViewConfig = useSetViewConfig(viewConfigStoreApi);


  // Need obsSets and sampleSets options to obtain mapping between
  // group names and column names.
  const obsSetsLoader = useMatchingLoader(
    loaders, dataset, DataType.OBS_SETS, { obsType },
  );
  const sampleSetsLoader = useMatchingLoader(
    loaders, dataset, DataType.SAMPLE_SETS, { sampleType },
  );
  const sampleSetsColumnNameMappingReversed = useColumnNameMapping(sampleSetsLoader, true);

  const [mode] = useState(null);
  const [currentModalityAgnosticSelection, setCurrentModalityAgnosticSelection] = useState(null);
  const [currentModalitySpecificSelection, setCurrentModalitySpecificSelection] = useState(null);
  const [currentStratificationSelection, setCurrentStratificationSelection] = useState(null);

  const autocompleteFeature = useAsyncFunction(AsyncFunctionType.AUTOCOMPLETE_FEATURE);
  const transformFeature = useAsyncFunction(AsyncFunctionType.TRANSFORM_FEATURE);

  const autocompleteNode = useCallback(async (inputValue) => {
    const results = await autocompleteFeature(inputValue);
    return results.map(item => ({
      label: item.label,
      data: item,
    }));
  }, [autocompleteFeature]);
  const getEdges = useCallback(
    async (node, targetModality) => transformFeature(node, targetModality),
    [transformFeature],
  );

  const [{ comparisonMetadata }, cmpMetadataStatus, cmpMetadataUrls] = useComparisonMetadata(
    loaders, dataset, false, {}, {}, { obsType, sampleType },
  );
  const stratificationOptions = useMemo(() => {
    /*
      return array of objects like {
        stratificationId: 'aki-vs-hr',
        name: 'Acute kidney injury (AKI) vs. Healthy reference',
        stratificationType: 'sampleSet', // key changed from 'groupType'. value changed from 'clinical'
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

  // TODO: Remove mode/step logic
  // TODO: remove currentModalityAgnostic/SpecificSelection and use featureSelection + sampleSetSelection as the source of truth.
  // Get rid of the local state within the children components and pass down the coordination values and setters directly
  // so that everything stays in sync.
  // E.g., if a user selects a gene from the volcano plot, the autocomplete input should reflect that selection
  // and allow the user to view the corresponding gene info / gene card.

  return (
    <>
      <BiomarkerSelectAlt
        setFeatureSelection={setFeatureSelection}
        setSampleSetFilter={setSampleSetFilter}
        setSampleSetSelection={setSampleSetSelection}
        currentModalityAgnosticSelection={currentModalityAgnosticSelection}
        setCurrentModalityAgnosticSelection={setCurrentModalityAgnosticSelection}
        setCurrentModalitySpecificSelection={setCurrentModalitySpecificSelection}
        autocompleteNode={autocompleteNode}
        stratifications={stratificationOptions}

        onFinish={() => {
          if (mode === 'exploratory') {
            // mode is exploratory, configure accordingly.

            // TODO

          } else {
            // mode is confirmatory, configure accordingly.

            // TODO
          }

          const newViewConfig = {
            ...viewConfig,
            coordinationSpace: {
              ...viewConfig.coordinationSpace,
              sampleSetFilter: {
                ...viewConfig.coordinationSpace.sampleSetFilter,
                __comparison__: currentStratificationSelection?.sampleSets,
              },
              sampleSetSelection: {
                ...viewConfig.coordinationSpace.sampleSetSelection,
                __comparison__: currentStratificationSelection?.sampleSets,
              },
              featureSelection: {
                ...viewConfig.coordinationSpace.featureSelection,
                __comparison__: currentModalitySpecificSelection ? currentModalitySpecificSelection.map(d => d.label) : null,
              },
            },
          };

          // TODO: can the normal coordination value setters be used instead?
          // (e.g., setFeatureSelection, setSampleSetSelection)
          setViewConfig(newViewConfig);
        }}
      />
    </>
  );
}
