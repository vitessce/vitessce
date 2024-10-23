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

/*
const kgBaseUrl = 'https://storage.googleapis.com/vitessce-demo-data/enrichr-kg-september-2023';

function cellTypeQueryFn(ctx) {
  const [fileName] = ctx.queryKey;
  return fetch(`${kgBaseUrl}/${fileName}`)
    .then(res => res.text())
    .then((res) => {
      const result = csvParse(res);
      return result.map(d => ({
        kgId: d.id,
        label: d.label,
        term: d.cell_id.length ? d.cell_id : null,
        nodeType: 'cellType',
      }));
    });
}
*/

/**
 * 
 * @param {object} props 
 * @param {{ name: string, stratificationType: string, sampleSets: [string[], string[]]}[]} props.stratificationOptions
 * @returns 
 */
export function BiomarkerSelectSubscriber(props) {
  const {
    coordinationScopes,
    theme,
    stratificationOptions,
  } = props;
  
  const [{
    sampleSetSelection,
    featureSelection,
  }, {
    setSampleSetSelection,
    setFeatureSelection,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.BIOMARKER_SELECT], coordinationScopes);

  const viewConfigStoreApi = useViewConfigStoreApi();
  const viewConfig = useViewConfig();
  const setViewConfig = useSetViewConfig(viewConfigStoreApi);

  console.log(viewConfig);
  

  // TODO: make isSelecting a coordination type plugin.
  // TODO: use store hooks from @vitessce/vit-s to update the view config based on the selections.
  const [isSelecting, setIsSelecting] = useState(true);

  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(null);
  const [currentModalityAgnosticSelection, setCurrentModalityAgnosticSelection] = useState(null);
  const [currentModalitySpecificSelection, setCurrentModalitySpecificSelection] = useState(null);
  const [currentStratificationSelection, setCurrentStratificationSelection] = useState(null);
  
  // Getting all data from the network
  /*
  const cellTypeQuery = useQuery({
    placeholderData: [],
    queryKey: ['HuBMAP_ASCTplusB_augmented_2022.nodes.csv'],
    queryFn: cellTypeQueryFn,
  });
  
  const cellTypeList = cellTypeQuery.data
    ?.filter(d => d.label.endsWith('Kidney'))
    .filter(d => d.term !== null);
  */


  const autocompleteFeature = useAsyncFunction(AsyncFunctionType.AUTOCOMPLETE_FEATURE);
  const transformFeature = useAsyncFunction(AsyncFunctionType.TRANSFORM_FEATURE);

  const autocompleteNode = useCallback(async inputValue => await autocompleteFeature(inputValue), [autocompleteFeature]);

  const getEdges = useCallback(async (node, targetModality) => await transformFeature(node, targetModality), [transformFeature]);

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
            console.log("Done selecting");
            console.log(viewConfig);
            setViewConfig({
              ...viewConfig,
              coordinationSpace: {
                ...viewConfig.coordinationSpace,
                sampleSetSelection: {
                  ...viewConfig.coordinationSpace.sampleSetSelection,
                  case: [currentStratificationSelection?.sampleSets[0]],
                  control: [currentStratificationSelection?.sampleSets[1]],
                  'case-control': currentStratificationSelection?.sampleSets,
                },
              },
            });
            console.log(currentStratificationSelection);
            //setSampleSetSelection(currentStratificationSelection?.sampleSets);
            //setViewConfig({ ...viewConfig, layout: [] })
            //setIsSelecting(false)
          }}
        />
      ) : null}
    </>
  );
}
