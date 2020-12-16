import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';

const useStyles = makeStyles(theme => ({
  checkbox: {
    color: theme.palette.primaryForeground,
    '&:checked': {
      color: theme.palette.primaryForeground,
    },
  },
  label: {
    marginLeft: 0,
  },
  formControl: {
    width: '100%',
  },
  slider: {
    width: '50%',
    margin: '0px 15px',
    verticalAlign: 'middle',
  },
}));

export default function ScatterplotOptions(props) {
  const {
    open,
    cellRadius,
    setCellRadius,
    cellSetLabelsVisible,
    setCellSetLabelsVisible,
    cellSetLabelSize,
    setCellSetLabelSize,
    cellSetPolygonsVisible,
    setCellSetPolygonsVisible,
  } = props;

  const classes = useStyles();

  function handleRadiusChange(event, value) {
    setCellRadius(value);
  }

  function handleLabelVisibilityChange(event) {
    setCellSetLabelsVisible(event.target.checked);
  }

  function handleLabelSizeChange(event, value) {
    setCellSetLabelSize(value);
  }

  function handlePolygonVisibilityChange(event) {
    setCellSetPolygonsVisible(event.target.checked);
  }

  return (
    <CSSTransition
      classNames="options-pane-container"
      in={open}
      appear
      exit
      unmountOnExit
      timeout={200}
    >
      <div className="options-pane-container">
        <h4>Scatterplot Options</h4>
        <Typography gutterBottom display="inline">
                    Cell Radius
        </Typography>
        <Slider
          className={classes.slider}
          value={cellRadius}
          onChange={handleRadiusChange}
          aria-labelledby="cell-radius-slider"
          valueLabelDisplay="auto"
          step={0.25}
          min={0.25}
          max={5}
        />
        <FormControl component="fieldset" className={classes.formControl}>
          <FormGroup aria-label="position" row>
            <FormControlLabel
              className={classes.label}
              value="start"
              control={(
                <Checkbox
                  className={classes.checkbox}
                  checked={cellSetLabelsVisible}
                  onChange={handleLabelVisibilityChange}
                  name="scatterplot-option-cell-set-labels"
                  color="default"
                />
                            )}
              label="Cell Set Labels Visible"
              labelPlacement="start"
            />
          </FormGroup>
        </FormControl>
        <Typography gutterBottom display="inline">
                    Cell Set Label Size
        </Typography>
        <Slider
          className={classes.slider}
          value={cellSetLabelSize}
          onChange={handleLabelSizeChange}
          aria-labelledby="cell-set-label-size-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={8}
          max={36}
        />
        <FormControl component="fieldset" className={classes.formControl}>
          <FormGroup aria-label="position" row>
            <FormControlLabel
              className={classes.label}
              value="start"
              control={(
                <Checkbox
                  className={classes.checkbox}
                  checked={cellSetPolygonsVisible}
                  onChange={handlePolygonVisibilityChange}
                  name="scatterplot-option-cell-set-polygons"
                  color="default"
                />
                            )}
              label="Cell Set Polygons Visible"
              labelPlacement="start"
            />
          </FormGroup>
        </FormControl>
      </div>
    </CSSTransition>
  );
}
