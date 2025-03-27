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
} from '@vitessce/vit-s';
import { AsyncFunctionType, ViewType, COMPONENT_COORDINATION_TYPES, DataType } from '@vitessce/constants-internal';
import { ScmdUi } from './scmd-ui.js';

/**
 *
 * @param {object} props
 * @param {{ name: string, stratificationType: string, sampleSets: [string[], string[]]}[]} props.stratificationOptions
 * @returns
 */
export function BiomarkerSelectSubscriber(props) {
  const {
    coordinationScopes,
    stratificationOptions: stratificationOptionsProp, // TODO: Remove; Get from comparisonMetadata instead
  } = props;

  const loaders = useLoaders();

  const [{
    dataset,
    obsType,
    sampleType,
    sampleSetSelection,
    featureSelection,
  }, {
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

  // TODO: make isSelecting a coordination type plugin.
  // TODO: use store hooks from @vitessce/vit-s to update the view config based on the selections.
  const [isSelecting, setIsSelecting] = useState(true);

  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(null);
  const [currentModalityAgnosticSelection, setCurrentModalityAgnosticSelection] = useState(null);
  const [currentModalitySpecificSelection, setCurrentModalitySpecificSelection] = useState(null);
  const [currentStratificationSelection, setCurrentStratificationSelection] = useState(null);

  const autocompleteFeature = useAsyncFunction(AsyncFunctionType.AUTOCOMPLETE_FEATURE);
  const transformFeature = useAsyncFunction(AsyncFunctionType.TRANSFORM_FEATURE);

  const autocompleteNode = useCallback(
    async inputValue => autocompleteFeature(inputValue),
    [autocompleteFeature],
  );
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

  return (
    <>
      {isSelecting ? (
        <ScmdUi
          mode={mode}
          setMode={setMode}
          step={step}
          setStep={setStep}
          currentModalityAgnosticSelection={currentModalityAgnosticSelection}
          setCurrentModalityAgnosticSelection={setCurrentModalityAgnosticSelection}
          currentModalitySpecificSelection={currentModalitySpecificSelection}
          setCurrentModalitySpecificSelection={setCurrentModalitySpecificSelection}
          currentStratificationSelection={currentStratificationSelection}
          setCurrentStratificationSelection={setCurrentStratificationSelection}
          autocompleteNode={autocompleteNode}
          getEdges={getEdges}
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
      ) : null}
    </>
  );
}
