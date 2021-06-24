import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import OptionsContainer from '../shared-plot-options/OptionsContainer';
import CellColorEncodingOption from '../shared-plot-options/CellColorEncodingOption';

const useStyles = makeStyles(() => createStyles({
  cameraLabel: {
    padding: '0px 0px 0px 16px',
  },
  box: {
    padding: '0px',
  },
  button: {
    padding: '0px 0px 0px 8px',
  },
}));

const ToggleFixedAxisButton = ({
  setUseFixedAxis,
  useFixedAxis,
  use3d,
}) => {
  const classes = useStyles();
  return (
    <TableRow>
      <TableCell className={classes.cameraLabel}>
      Fix Camera Axis
      </TableCell>
      <TableCell className={classes.box}>
        <Checkbox
          onClick={() => setUseFixedAxis(!useFixedAxis)}
          disabled={!use3d}
          checked={Boolean(useFixedAxis)}
        />
      </TableCell>
    </TableRow>
  );
};

export default function SpatialOptions(props) {
  const {
    observationsLabel,
    cellColorEncoding,
    setCellColorEncoding,
    setUseFixedAxis,
    useFixedAxis,
    use3d,
  } = props;

  return (
    <OptionsContainer>
      <CellColorEncodingOption
        observationsLabel={observationsLabel}
        cellColorEncoding={cellColorEncoding}
        setCellColorEncoding={setCellColorEncoding}
      />
      <ToggleFixedAxisButton
        setUseFixedAxis={setUseFixedAxis}
        useFixedAxis={useFixedAxis}
        use3d={use3d}
      />
    </OptionsContainer>
  );
}
