import React, { useCallback, useEffect } from 'react';
import { RadioTable } from '../selectable-table';

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
    if (selection && selection.key) {
      setSelectedFactor(selection.key);
    }
  }, [setSelectedFactor]);

  const rowKey = 'Factor';
  const columns = [
    rowKey,
  ];
  const data = Object.entries(factorsSelected).map(
    ([factorId, value]) => ({ [rowKey]: factorId, value }),
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
