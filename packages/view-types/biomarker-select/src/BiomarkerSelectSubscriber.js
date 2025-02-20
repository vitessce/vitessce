/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react';
import {
  useAsyncFunction,
  useViewConfigStoreApi,
  useSetViewConfig,
  useViewConfig,
  useCoordination,
} from '@vitessce/vit-s';
import { AsyncFunctionType, ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
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
    stratificationOptions,
  } = props;

  const [{
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
            setViewConfig({
              ...viewConfig,
              coordinationSpace: {
                ...viewConfig.coordinationSpace,
                sampleSetFilter: {
                  ...viewConfig.coordinationSpace.sampleSetFilter,
                  'case-control': currentStratificationSelection?.sampleSets,
                },
                sampleSetSelection: {
                  ...viewConfig.coordinationSpace.sampleSetSelection,
                  'case-control': currentStratificationSelection?.sampleSets,
                },
              },
            });
          }}
        />
      ) : null}
    </>
  );
}
