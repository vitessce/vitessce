import React from 'react';
import OptionsContainer from '../shared-plot-options/OptionsContainer';
import CellColorEncodingOption from '../shared-plot-options/CellColorEncodingOption';
import Checkbox3DOption from './Checkbox3DOption';

export default function SpatialOptions(props) {
  const {
    observationsLabel,
    cellColorEncoding,
    setCellColorEncoding,
    use3D,
    setUse3D,
  } = props;

  return (
    <OptionsContainer>
      <CellColorEncodingOption
        observationsLabel={observationsLabel}
        cellColorEncoding={cellColorEncoding}
        setCellColorEncoding={setCellColorEncoding}
      />
      <Checkbox3DOption use3D={use3D} setUse3D={setUse3D} />
    </OptionsContainer>
  );
}
