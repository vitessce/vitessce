import React from 'react';
import { SelectableTable } from '../selectable-table/index';

export default function Genes(props) {
  const {
    geneList = [],
    geneSelection = [],
    geneFilter = null,
    setGeneSelection,
  } = props;

  function onChange(selection) {
    if (setGeneSelection && selection && selection.name) {
      setGeneSelection([selection.name]);
    }
  }

  const data = geneList
    .filter(gene => (geneFilter ? geneFilter.includes(gene) : true))
    .sort((a, b) => a.localeCompare(b))
    .map(
      gene => ({ name: gene, value: (geneSelection ? geneSelection.includes(gene) : false) }),
    );

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
