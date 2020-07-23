import React, { useEffect, useCallback } from 'react';
import { SelectableTable } from '../selectable-table/index';

export default function Genes(props) {
  const {
    setSelectedGene,
    genesSelected,
    clearPleaseWait,
  } = props;

  useEffect(() => {
    if (clearPleaseWait && genesSelected) {
      clearPleaseWait('expression-matrix');
    }
  }, [clearPleaseWait, genesSelected]);

  const onChange = useCallback((selection) => {
    if (selection && selection.name) {
      setSelectedGene(selection.name);
    }
  }, [setSelectedGene]);

  const data = genesSelected ? Object.entries(genesSelected).sort(
    (a, b) => a[0].localeCompare(b[0]),
  ).map(
    ([name, value]) => ({ name, value }),
  ) : [];
  return (
    <SelectableTable
      columns={['name']}
      data={data}
      idKey="name"
      valueKey="value"
      onChange={onChange}
      allowUncheck={false}
      showTableHead={false}
    />
  );
}
