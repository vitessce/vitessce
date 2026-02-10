/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import React, { useMemo, useState, useCallback } from 'react';
import { Vitessce } from '@vitessce/all';
import { isEqual } from 'lodash-es';
import { ComparativePageComponent, generateComparativeConfig } from './ComparativeConfig.jsx';

export function ControlledComparative(props) {
  const {
    datasetUrl = 'https://data-2.vitessce.io/kpmp-atlas-v2/sn-rna-seq/processed/kpmp-aug-2025.adata.zarr',
    geneSelection,
    setGeneSelection,
    sampleSetSelection,
    setSampleSetSelection,
    theme = 'light2',
    debugMode = false,
    logLevel = undefined,
  } = props;

  const initialConfig = useMemo(() => generateComparativeConfig(datasetUrl, false), [datasetUrl]);
  const [currentConfig, setCurrentConfig] = useState(null);
  // Merge currentConfig with geneSelection and sampleSetSelection,
  // which may have been updated from outside Vitessce (e.g., from URL params).
  const mergedConfig = useMemo(() => {
    if (!currentConfig) {
      return initialConfig;
    }
    // Merge currentConfig with geneSelection and sampleSetSelection.
    const isValidGeneSelection = Array.isArray(geneSelection) && geneSelection.every(g => typeof g === 'string');
    const isValidSampleSetSelection = Array.isArray(sampleSetSelection) && sampleSetSelection.every(s => Array.isArray(s) && s.every(t => typeof t === 'string'));

    // Check if geneSelection or sampleSetSelection have changed before specifying a different config.uid value.
    const prevGeneSelection = currentConfig.coordinationSpace?.featureSelection?.__comparison__;
    const prevSampleSetSelection = currentConfig.coordinationSpace?.sampleSetSelection?.__comparison__;
    if (isEqual(prevGeneSelection, geneSelection)
          && isEqual(prevSampleSetSelection, sampleSetSelection)
    ) {
      return currentConfig;
    }

    const newConfig = {
      ...currentConfig,
      // Note: this forces Vitessce to re-initialize the coordination space for featureSelection and sampleSetSelection,
      // but it also causes the data to be re-loaded.
      uid: `controlled-comparative-${Date.now()}`,
      coordinationSpace: {
        ...currentConfig.coordinationSpace,
        featureSelection: {
          ...currentConfig.coordinationSpace?.featureSelection,
          __comparison__: (isValidGeneSelection
            ? geneSelection
            : currentConfig.coordinationSpace?.featureSelection?.__comparison__
          ),
        },
        sampleSetSelection: {
          ...currentConfig.coordinationSpace?.sampleSetSelection,
          __comparison__: (
            isValidSampleSetSelection
              ? sampleSetSelection
              : currentConfig.coordinationSpace?.sampleSetSelection?.__comparison__
          ),
        },
      },
    };

    // console.log(geneSelection, isValidGeneSelection, newConfig);
    return newConfig;
  }, [initialConfig, currentConfig, geneSelection, sampleSetSelection]);


  const onConfigChange = useCallback((newConfig) => {
    // Listen for changes to the config from inside vITESSCE
    setCurrentConfig(newConfig);

    // Listen for changes to featureSelection and sampleSetSelection in the coordination space.
    const newFeatureSelection = newConfig.coordinationSpace?.featureSelection?.__comparison__;
    const newSampleSetSelection = newConfig.coordinationSpace?.sampleSetSelection?.__comparison__;

    // Was there a new selection made from inside Vitessce?
    // Note: this will prevent from CLEARING the selections from inside Vitessce
    // (any clearing will need to be done from the BiomarkerSelect UI).
    const hasNewGeneSelection = (
      Array.isArray(newFeatureSelection)
                && newFeatureSelection.length > 0
                && !isEqual(newFeatureSelection, geneSelection)
    );
    const hasNewSampleSetSelection = (
      Array.isArray(newSampleSetSelection)
            && newSampleSetSelection.length > 0
            && !isEqual(newSampleSetSelection, sampleSetSelection)
    );

    if (hasNewGeneSelection) {
      setGeneSelection(newFeatureSelection);
    }
    if (hasNewSampleSetSelection) {
      setSampleSetSelection(newSampleSetSelection);
    }
  }, [geneSelection, sampleSetSelection]);

  const didFirstValidation = currentConfig !== null;

  return (
    <div>
      <Vitessce
        config={mergedConfig}
        onConfigChange={onConfigChange}
        remountOnUidChange={false}
        validateConfig={!didFirstValidation}
        validateOnConfigChange={false}
        rowHeight={null}
        theme={theme}
        pageMode
        debugMode={debugMode}
        logLevel={logLevel}
      >
        <ComparativePageComponent />
      </Vitessce>
    </div>
  );
}
