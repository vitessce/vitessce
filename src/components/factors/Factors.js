import React, { useCallback, useEffect } from 'react';
import { SelectableTable } from '../selectable-table/index';

export default function Factors(props) {
  const {
    setSelectedFactor,
    factorsSelected,
    clearPleaseWait,
  } = props;

  useEffect(() => {
    if (clearPleaseWait && factorsSelected) {
      clearPleaseWait('factors');
    }
  }, [clearPleaseWait, factorsSelected]);

  const onChange = useCallback((selection) => {
    if (selection && selection.name) {
      setSelectedFactor(selection.name);
    }
  }, [setSelectedFactor]);

  const data = Object.entries(factorsSelected).map(
    ([name, value]) => ({ name, value }),
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
