/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import React, { useMemo, useState, useCallback } from 'react';
import { Vitessce } from '@vitessce/all';
import { isEqual } from 'lodash-es';
import {
  BiomarkerSelectPageComponent,
  generateComparativeConfig,
  getSelectedModality,
  resolveSelectedModality,
  withSelectedModality,
} from './ComparativeConfig.jsx';

/**
 * Renders the biomarkerSelectAlt view, synchronizing
 * gene selection, sample set selection, and modality selection
 * state with its parent.
 * See the ControlledComparative component for documentation of the props.
 */
export function BiomarkerSelect(props) {
  const {
    singleCellDatasetUrl,
    singleNucleusDatasetUrl,
    selectedModality: selectedModalityProp,
    setSelectedModality,
    geneSelection,
    sampleSetSelection,
    setGeneSelection,
    setSampleSetSelection,
    theme = 'light2',
    debugMode = false,
    logLevel = undefined,
  } = props;

  const initialConfig = useMemo(() => generateComparativeConfig(
    { singleCellDatasetUrl, singleNucleusDatasetUrl },
    true,
  ), [singleCellDatasetUrl, singleNucleusDatasetUrl]);
  // Fall back to the first available modality if the selected one is not available.
  const selectedModality = useMemo(() => resolveSelectedModality(
    initialConfig.datasets.map(d => d.uid),
    selectedModalityProp,
  ), [initialConfig, selectedModalityProp]);
  const [currentConfig, setCurrentConfig] = useState(null);

  // Merge currentConfig with geneSelection and sampleSetSelection,
  // which may have been updated from outside Vitessce (e.g., from URL params).
  const mergedConfig = useMemo(() => {
    // Prior to the first onConfigChange, use the initial config as the base,
    // so that values from outside Vitessce (e.g., URL params on initial page load)
    // are present from the very first render.
    const baseConfig = currentConfig ?? initialConfig;
    // Merge baseConfig with geneSelection and sampleSetSelection.
    const isValidGeneSelection = Array.isArray(geneSelection) && geneSelection.every(g => typeof g === 'string');
    const isValidSampleSetSelection = Array.isArray(sampleSetSelection) && sampleSetSelection.every(s => Array.isArray(s) && s.every(t => typeof t === 'string'));

    const newConfig = withSelectedModality({
      ...baseConfig,
      coordinationSpace: {
        ...baseConfig.coordinationSpace,
        featureSelection: {
          ...baseConfig.coordinationSpace?.featureSelection,
          __comparison__: (isValidGeneSelection
            ? geneSelection
            : baseConfig.coordinationSpace?.featureSelection?.__comparison__
          ),
        },
        sampleSetSelection: {
          ...baseConfig.coordinationSpace?.sampleSetSelection,
          __comparison__: (
            isValidSampleSetSelection
              ? sampleSetSelection
              : baseConfig.coordinationSpace?.sampleSetSelection?.__comparison__
          ),
        },
      },
    }, selectedModality);
    return newConfig;
  }, [initialConfig, currentConfig, geneSelection, sampleSetSelection, selectedModality]);

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

    // Was a different modality (i.e., dataset) selected from inside Vitessce?
    const newModality = getSelectedModality(newConfig);
    if (typeof newModality === 'string' && newModality !== selectedModality) {
      setSelectedModality?.(newModality);
    }
  }, [geneSelection, sampleSetSelection, selectedModality,
    setGeneSelection, setSampleSetSelection, setSelectedModality]);

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
        <BiomarkerSelectPageComponent />
      </Vitessce>
    </div>
  );
}
