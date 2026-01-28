import React, { useMemo, useState, useCallback } from 'react';
import { Vitessce } from '@vitessce/all';
import { BiomarkerSelectPageComponent, generateComparativeConfig } from './ComparativeConfig.jsx';
import { isEqual } from 'lodash-es';

export function BiomarkerSelect(props) {
    const {
        datasetUrl = 'https://data-2.vitessce.io/kpmp-atlas-v2/sn-rna-seq/processed/kpmp-aug-2025.adata.zarr',
        geneSelection,
        sampleSetSelection,
        setGeneSelection,
        setSampleSetSelection,
        theme = 'light2',
        debugMode = false,
        logLevel = undefined,
    } = props;

    const initialConfig = useMemo(() => generateComparativeConfig(datasetUrl, true), [datasetUrl]);
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
        
        const newConfig = {
            ...currentConfig,
            coordinationSpace: {
                ...currentConfig.coordinationSpace,
                featureSelection: {
                    ...currentConfig.coordinationSpace?.featureSelection,
                    '__comparison__': (isValidGeneSelection
                        ? geneSelection
                        : currentConfig.coordinationSpace?.featureSelection?.['__comparison__']
                    ),
                },
                sampleSetSelection: {
                    ...currentConfig.coordinationSpace?.sampleSetSelection,
                    '__comparison__': (
                        isValidSampleSetSelection
                            ? sampleSetSelection
                            : currentConfig.coordinationSpace?.sampleSetSelection?.['__comparison__']
                    ),
                },
            },
        };
        return newConfig;
    }, [initialConfig, currentConfig, geneSelection, sampleSetSelection]);

    const onConfigChange = useCallback((newConfig) => {
      // Listen for changes to the config from inside vITESSCE
      setCurrentConfig(newConfig);

      // Listen for changes to featureSelection and sampleSetSelection in the coordination space.
      const newFeatureSelection = newConfig.coordinationSpace?.featureSelection?.['__comparison__'];
      const newSampleSetSelection = newConfig.coordinationSpace?.sampleSetSelection?.['__comparison__'];

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

      if(hasNewGeneSelection) {
          setGeneSelection(newFeatureSelection);
      }
      if(hasNewSampleSetSelection) {
          setSampleSetSelection(newSampleSetSelection);
      }
  }, [geneSelection, sampleSetSelection]);

    return (
        <div>
            <Vitessce
                config={mergedConfig}
                onConfigChange={onConfigChange}
                rowHeight={null}
                theme={theme}
                pageMode={true}
                debugMode={debugMode}
                logLevel={logLevel}
            >
                <BiomarkerSelectPageComponent />
            </Vitessce>
        </div>
    );
}