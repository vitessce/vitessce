import React, { useEffect, useCallback } from 'react';
import { RadioList } from '../selectable-table/index';

export default function Genes(props) {
  const {
    setSelectedGene,
    genesSelected,
    clearPleaseWait,
  } = props;

  useEffect(() => {
    if (clearPleaseWait && genesSelected) {
      clearPleaseWait('genes');
    }
  }, [clearPleaseWait, genesSelected]);

  const onChange = useCallback((selection) => {
    if (selection && selection.name) {
      setSelectedGene(selection.name);
    }
  }, [setSelectedGene]);

  const data = Object.entries(genesSelected).sort(
    (a, b) => a[0].localeCompare(b[0]),
  ).map(
    ([name, value]) => ({ name, value }),
  );
  return (
    <RadioList
      data={data}
      onChange={onChange}
    />
  );
}
