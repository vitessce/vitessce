import React, { useEffect, useCallback } from 'react';
import { RadioTable } from '../selectable-table';

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
    if (selection && selection.key) {
      setSelectedGene(selection.key);
    }
  }, [setSelectedGene]);

  const rowKey = 'Genes';
  const columns = [
    rowKey,
  ];
  const data = Object.entries(genesSelected).sort(
    (a, b) => a[0].localeCompare(b[0]),
  ).map(
    ([geneId, value]) => ({ [rowKey]: geneId, value }),
  );
  return (
    <RadioTable
      columns={columns}
      data={data}
      rowKey={rowKey}
      onChange={onChange}
    />
  );
}
