import React, { useCallback, useEffect } from 'react';
import { RadioList } from '../selectable-table';

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
    <RadioList
      data={data}
      onChange={onChange}
    />
  );
}
