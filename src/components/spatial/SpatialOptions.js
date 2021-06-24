import React from 'react';
import { Matrix4 } from 'math.gl';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { getDefaultInitialViewState } from '@hms-dbmi/viv';
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
const ReCenterButton = ({
  setViewState,
  height,
  width,
  loader,
  use3d,
  modelMatrix,
}) => {
  const classes = useStyles();
  return (
    <TableRow>
      <TableCell className={classes.button}>
        <Button
          onClick={() => {
            const defaultViewState = getDefaultInitialViewState(
              loader.data,
              { height, width },
              1.5,
              use3d,
              new Matrix4(modelMatrix),
            );
            setViewState({
              ...defaultViewState,
              rotationX: 0,
              rotationOrbit: 0,
            });
          }}
          disabled={!use3d}
        >
          Re-Center
        </Button>
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
    setViewState,
    useFixedAxis,
    use3d,
    height,
    width,
    loader,
    modelMatrix,
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
      <ReCenterButton
        setViewState={setViewState}
        use3d={use3d}
        height={height}
        width={width}
        loader={loader}
        modelMatrix={modelMatrix}
      />
    </OptionsContainer>
  );
}
