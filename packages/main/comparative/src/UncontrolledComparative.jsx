/* eslint-disable max-len */
/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
// eslint-disable-next-line import/no-unresolved
import { NuqsAdapter } from 'nuqs/adapters/react';
import {
  useQueryState, parseAsString, parseAsArrayOf, parseAsStringLiteral,
} from 'nuqs';
import { ControlledComparative } from './ControlledComparative.jsx';
import { BiomarkerSelect } from './BiomarkerSelect.jsx';
import { COMPARATIVE_MODALITIES } from './ComparativeConfig.jsx';

const MODALITY_UIDS = COMPARATIVE_MODALITIES.map(m => m.uid);

/**
 * The UncontrolledComparative component is a wrapper
 * around the ControlledComparative and BiomarkerSelect components.
 * @param {object} props
 * At least one of singleCellDatasetUrl or singleNucleusDatasetUrl must be provided.
 * When both are provided, the user can switch between modalities.
 * @param {string} [props.singleCellDatasetUrl] URL of the single-cell
 * dataset to load, which should point to the root of an anndata-zarr store,
 * containing comparative metadata.
 * @param {string} [props.singleNucleusDatasetUrl] URL of the single-nucleus
 * dataset to load, which should point to the root of an anndata-zarr store,
 * containing comparative metadata.
 * @param {boolean} props.enableQueryParams Whether to
 * sync state to the URL query parameters for gene, sample set,
 * and modality selection. By default, true.
 * @returns {JSX.Element}
 */
function UncontrolledComparativeInner(props) {
  const {
    singleCellDatasetUrl,
    singleNucleusDatasetUrl,
    enableQueryParams = true,
  } = props;

  const [geneSelectionViaUrl, setGeneSelectionViaUrl] = useQueryState(
    'gene',
    parseAsArrayOf(parseAsString),
  );
  const [sampleSetSelectionViaUrl, setSampleSetSelectionViaUrl] = useQueryState(
    'groups',
    parseAsArrayOf(parseAsArrayOf(parseAsString)),
  );
  const [modalitySelectionViaUrl, setModalitySelectionViaUrl] = useQueryState(
    'modality',
    parseAsStringLiteral(MODALITY_UIDS),
  );

  const [geneSelectionNonUrl, setGeneSelectionNonUrl] = useState([]);
  const [sampleSetSelectionNonUrl, setSampleSetSelectionNonUrl] = useState([]);
  const [modalitySelectionNonUrl, setModalitySelectionNonUrl] = useState(null);

  // Depending on the value of enableQueryParams,
  // we either use the state that is synced to the URL query parameters,
  // or we use local state that is not synced to the URL.
  const geneSelection = enableQueryParams ? geneSelectionViaUrl : geneSelectionNonUrl;
  const setGeneSelection = enableQueryParams ? setGeneSelectionViaUrl : setGeneSelectionNonUrl;
  const sampleSetSelection = enableQueryParams ? sampleSetSelectionViaUrl : sampleSetSelectionNonUrl;
  const setSampleSetSelection = enableQueryParams ? setSampleSetSelectionViaUrl : setSampleSetSelectionNonUrl;
  const selectedModality = enableQueryParams ? modalitySelectionViaUrl : modalitySelectionNonUrl;
  const setSelectedModality = enableQueryParams ? setModalitySelectionViaUrl : setModalitySelectionNonUrl;

  if (Array.isArray(sampleSetSelection) && sampleSetSelection.length > 2) {
    throw new Error('groups query param array can have at most two entries.');
  }

  return (
    <div>
      <BiomarkerSelect
        singleCellDatasetUrl={singleCellDatasetUrl}
        singleNucleusDatasetUrl={singleNucleusDatasetUrl}
        selectedModality={selectedModality}
        setSelectedModality={setSelectedModality}
        geneSelection={geneSelection}
        setGeneSelection={setGeneSelection}
        sampleSetSelection={sampleSetSelection}
        setSampleSetSelection={setSampleSetSelection}
      />
      <ControlledComparative
        singleCellDatasetUrl={singleCellDatasetUrl}
        singleNucleusDatasetUrl={singleNucleusDatasetUrl}
        selectedModality={selectedModality}
        setSelectedModality={setSelectedModality}
        geneSelection={geneSelection}
        setGeneSelection={setGeneSelection}
        sampleSetSelection={sampleSetSelection}
        setSampleSetSelection={setSampleSetSelection}
      />
    </div>
  );
}

/**
 * The UncontrolledComparative component is a Provider component
 * that wraps the UncontrolledComparativeInner component.
 * See the UncontrolledComparativeInner component documentation
 * for details on the props (all props are simply passed through).
 * @param {*} props
 * @returns
 */
export function UncontrolledComparative(props) {
  return (
    <NuqsAdapter>
      <UncontrolledComparativeInner
        {...props}
      />
    </NuqsAdapter>
  );
}
