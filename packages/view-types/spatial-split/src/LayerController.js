import { useState } from 'react';
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    marginTop: '7px',
  },
  markActive: {
    backgroundColor: 'rgba(128, 128, 128, 0.7)',
  },
});

/**
 * Wrapper for the slider that chooses global selections (z, t etc.).
 * @prop {string} field The dimension this selects for (z, t etc.).
 * @prop {number} value Currently selected index (1, 4, etc.).
 * @prop {function} handleChange Callback for every change in selection.
 * @prop {function} possibleValues All available values for the field.
 */
function GlobalSelectionSlider({
  field,
  value,
  handleChange,
  possibleValues,
}) {
  const classes = useStyles();
  return (
    <Slider
      classes={{ root: classes.root, markActive: classes.markActive }}
      value={value}
      // See https://github.com/hms-dbmi/viv/issues/176 for why
      // we have the two handlers.
      onChange={
        (event, newValue) => {
          handleChange(newValue);
        }
      }
      onChangeCommitted={
        (event, newValue) => {
          handleChange(newValue);
        }
      }
      track={false}
      valueLabelDisplay="auto"
      getAriaLabel={() => `${field} slider`}
      marks={possibleValues.map(val => ({ value: val }))}
      min={Number(possibleValues[0])}
      max={Number(possibleValues.slice(-1))}
      orientation="horizontal"
      step={null}
    />
  );
}

export default function LayerController(props) {
  const {
    spatialTargetT,
    setSpatialTargetT,
    possibleT,
    spatialTargetZ,
    setSpatialTargetZ,
    possibleZ,
    pointLayerCoordination,
    segmentationLayerCoordination,
    imageLayerCoordination,
    imageChannelCoordination,
  } = props;

  return (
    <div>
      <p>
        <span>T: </span>
        <GlobalSelectionSlider
          field="T"
          value={spatialTargetT}
          handleChange={setSpatialTargetT}
          possibleValues={possibleT}
        />
      </p>
      <p>
        <span>Z:</span>
        <GlobalSelectionSlider
          field="Z"
          value={spatialTargetZ}
          handleChange={setSpatialTargetZ}
          possibleValues={possibleZ}
        />
      </p>
      <p>
        <span>Points</span>
        <ul>
          {pointLayerCoordination?.[0] ? Object.entries(pointLayerCoordination[0]).map(([k, v]) => (
            <li>{k}: {JSON.stringify(v)}</li>
          )) : null}
        </ul>
        Segmentations
        <ul>
          {segmentationLayerCoordination?.[0] ? Object.entries(segmentationLayerCoordination[0]).map(([k, v]) => (
            <li>{k}: {JSON.stringify(v)}</li>
          )) : null}
        </ul>
        Images
        <ul>
          {imageLayerCoordination?.[0] ? Object.entries(imageLayerCoordination[0]).map(([k, v]) => (
            <li>
              {k}: {JSON.stringify(v)}
              <ul>
                {imageChannelCoordination?.[0] ? Object.entries(imageChannelCoordination?.[0][k]).map(([k2, v2]) => (
                  <li>{k2}: {JSON.stringify(v2)}</li>
                )) : null}
              </ul>
            </li>
          )) : null}
        </ul>
      </p>
    </div>
  );
}
