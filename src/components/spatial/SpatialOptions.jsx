import React from 'react';
import OptionsContainer from '../shared-plot-options/OptionsContainer';
import CellColorEncodingOption from '../shared-plot-options/CellColorEncodingOption';

export default function SpatialOptions(props) {
  const {
    observationsLabel,
    cellColorEncoding,
    setCellColorEncoding,
  } = props;

  return (
    <OptionsContainer>
      <CellColorEncodingOption
        observationsLabel={observationsLabel}
        cellColorEncoding={cellColorEncoding}
        setCellColorEncoding={setCellColorEncoding}
      />
    </OptionsContainer>
  );
}
