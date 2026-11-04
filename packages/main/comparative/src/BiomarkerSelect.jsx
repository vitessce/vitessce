/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import React, { useMemo, useState, useCallback } from 'react';
import { Vitessce } from '@vitessce/all';
import { isEqual } from 'lodash-es';
import {
  BiomarkerSelectPageComponent,
  generateComparativeConfig,
  getSelectedModality,
  getBiomarkerSelection,
  resolveSelectedModality,
  mergeBiomarkerSelectConfig,
} from './ComparativeConfig.jsx';

/**
 * Renders the biomarkerSelectAlt view, synchronizing
 * biomarker selection, gene selection, sample set selection, and modality selection
 * state with its parent.
 * See the ControlledComparative component for documentation of the props.
 * @param {object} props
 * @param {{ label: string, nodeType: string } | null} [props.biomarkerSelection]
 * The selected modality-agnostic item (e.g., gene or pathway),
 * which is transformed into a list of genes (geneSelection) internally.
 * @param {Function} [props.setBiomarkerSelection] Setter function
 * called when the biomarker selection has been updated from inside.
 */
export function BiomarkerSelect(props) {
  const {
    singleCellDatasetUrl,
    singleNucleusDatasetUrl,
    selectedModality: selectedModalityProp,
    setSelectedModality,
    biomarkerSelection,
    setBiomarkerSelection,
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

  // Merge currentConfig with the selections that may have been
  // updated from outside Vitessce (e.g., from URL params or ControlledComparative).
  const mergedConfig = useMemo(() => mergeBiomarkerSelectConfig({
    currentConfig,
    initialConfig,
    geneSelection,
    sampleSetSelection,
    biomarkerSelection,
    selectedModality,
    createUid: () => `biomarker-select-${Date.now()}`,
  }), [initialConfig, currentConfig, biomarkerSelection, geneSelection, sampleSetSelection, selectedModality]);

  const onConfigChange = useCallback((newConfig) => {
    // Listen for changes to the config from inside vITESSCE
    setCurrentConfig(newConfig);

    // Listen for changes to featureSelection and sampleSetSelection in the coordination space.
    const newFeatureSelection = newConfig.coordinationSpace?.featureSelection?.__comparison__;
    const newSampleSetSelection = newConfig.coordinationSpace?.sampleSetSelection?.__comparison__;

    // Was there a new selection made from inside Vitessce?
    // Note: unlike in ControlledComparative, here we allow CLEARING the selections
    // (i.e., null or empty array values), since this is the UI from which
    // selections are cleared (e.g., selecting "All" in the "In group" dropdown).
    const hasNewGeneSelection = (
      newFeatureSelection !== undefined
        && !isEqual(newFeatureSelection, geneSelection)
    );
    const hasNewSampleSetSelection = (
      newSampleSetSelection !== undefined
        && !isEqual(newSampleSetSelection, sampleSetSelection)
    );

    if (hasNewGeneSelection) {
      setGeneSelection(newFeatureSelection);
    }
    if (hasNewSampleSetSelection) {
      setSampleSetSelection(newSampleSetSelection);
    }

    // Was a different biomarker (e.g., gene or pathway) selected from inside Vitessce?
    const newBiomarkerSelection = getBiomarkerSelection(newConfig);
    if (
      newBiomarkerSelection !== undefined
        && !isEqual(newBiomarkerSelection, biomarkerSelection)
    ) {
      setBiomarkerSelection?.(newBiomarkerSelection);
    }

    // Was a different modality (i.e., dataset) selected from inside Vitessce?
    const newModality = getSelectedModality(newConfig);
    if (typeof newModality === 'string' && newModality !== selectedModality) {
      setSelectedModality?.(newModality);
    }
  }, [biomarkerSelection, geneSelection, sampleSetSelection, selectedModality,
    setBiomarkerSelection, setGeneSelection, setSampleSetSelection, setSelectedModality]);

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
