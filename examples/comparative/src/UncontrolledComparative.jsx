import React from 'react';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { useQueryState, parseAsString, parseAsArrayOf } from 'nuqs';
import { ControlledComparative } from './ControlledComparative.jsx';
import { BiomarkerSelect } from './BiomarkerSelect.jsx';

function UncontrolledComparativeInner(props) {
  const {
    datasetUrl,
  } = props;

  const [geneSelection, setGeneSelection] = useQueryState(
    'gene',
    parseAsArrayOf(parseAsString),
  );
  const [sampleSetSelection, setSampleSetSelection] = useQueryState(
    'groups',
    parseAsArrayOf(parseAsArrayOf(parseAsString)),
  );

  if (Array.isArray(sampleSetSelection) && sampleSetSelection.length > 2) {
    throw new Error('groups query param array can have at most two entries.');
  }

  return (
    <div>
      <BiomarkerSelect
        datasetUrl={datasetUrl}
        geneSelection={geneSelection}
        setGeneSelection={setGeneSelection}
        sampleSetSelection={sampleSetSelection}
        setSampleSetSelection={setSampleSetSelection}
      />
      <ControlledComparative
        datasetUrl={datasetUrl}
        geneSelection={geneSelection}
        setGeneSelection={setGeneSelection}
        sampleSetSelection={sampleSetSelection}
        setSampleSetSelection={setSampleSetSelection}
      />
    </div>
  );
}

// This is a wrapper component which only provides the Nuqs context.
export function UncontrolledComparative(props) {
  return (
    <NuqsAdapter>
      <UncontrolledComparativeInner
        {...props}
      />
    </NuqsAdapter>
  );
}