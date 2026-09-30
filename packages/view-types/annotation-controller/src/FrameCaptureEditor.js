import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Tooltip,
  CenterFocusStrong,
} from '@vitessce/styles';
import { CoordinationType } from '@vitessce/constants-internal';
import {
  DEFAULT_CAPTURE_COORDINATION_TYPES,
  getCapturableCoordinationTypes,
} from './capture-utils.js';
import { getFrameViewCoordinationValues } from './story-utils.js';
import { useStyles } from './styles.js';

function getDefaultSelection(component) {
  return getCapturableCoordinationTypes(component)
    .filter(t => DEFAULT_CAPTURE_COORDINATION_TYPES.includes(t));
}

function CaptureTypeCheckbox(props) {
  const { coordinationType, isChecked, onToggle } = props;
  const { classes } = useStyles();
  return (
    <FormControlLabel
      className={classes.captureTypeLabel}
      control={(
        <Checkbox
          size="small"
          className={classes.captureTypeCheckbox}
          checked={isChecked}
          onChange={() => onToggle(coordinationType)}
        />
      )}
      label={coordinationType}
    />
  );
}

/**
 * Capture the current coordination values of one view into the active frame.
 * @param {object} props
 * @param {object} props.view The view definition, as { uid, component }.
 * @param {object} props.frame The active frame.
 * @param {string[]} props.selectedTypes The coordination types to capture.
 * @param {function} props.onSelectedTypesChange Callback, called with the new selected types.
 * @param {function} props.onCapture Callback, called with (viewUid, coordinationTypes).
 * @param {function} props.onRemoveValue Callback, called with (viewUid, coordinationType).
 */
function ViewCaptureEditor(props) {
  const {
    view, frame, selectedTypes, onSelectedTypesChange, onCapture, onRemoveValue,
  } = props;
  const { classes } = useStyles();
  const [isAllTypesVisible, setIsAllTypesVisible] = useState(false);

  const capturableTypes = getCapturableCoordinationTypes(view.component);
  const defaultTypes = getDefaultSelection(view.component);
  // Show the default types, plus any other types which have been selected.
  const visibleTypes = isAllTypesVisible
    ? capturableTypes
    : capturableTypes.filter(t => defaultTypes.includes(t) || selectedTypes.includes(t));
  const capturedTypes = Object.keys(getFrameViewCoordinationValues(frame, view.uid))
    .filter(t => t !== CoordinationType.ANNOTATION_SHAPES);

  function toggleType(coordinationType) {
    onSelectedTypesChange(selectedTypes.includes(coordinationType)
      ? selectedTypes.filter(t => t !== coordinationType)
      : [...selectedTypes, coordinationType]);
  }

  return (
    <div className={classes.captureView}>
      <div className={classes.captureViewHeader}>
        <span className={classes.captureViewName}>{`${view.uid} (${view.component})`}</span>
        <Tooltip title="Save the current state of this view (for the selected coordination types) into this frame">
          <span>
            <Button
              size="small"
              variant="outlined"
              className={classes.toolButton}
              startIcon={<CenterFocusStrong fontSize="inherit" />}
              disabled={selectedTypes.length === 0}
              onClick={() => onCapture(view.uid, selectedTypes)}
            >
              Capture
            </Button>
          </span>
        </Tooltip>
      </div>
      <div className={classes.captureTypeList}>
        {visibleTypes.map(coordinationType => (
          <CaptureTypeCheckbox
            key={coordinationType}
            coordinationType={coordinationType}
            isChecked={selectedTypes.includes(coordinationType)}
            onToggle={toggleType}
          />
        ))}
        <button
          type="button"
          className={classes.toggleTextButton}
          onClick={() => setIsAllTypesVisible(prev => !prev)}
        >
          {isAllTypesVisible ? 'Show fewer types' : `Show all ${capturableTypes.length} types`}
        </button>
      </div>
      {capturedTypes.length > 0 ? (
        <div className={classes.capturedValues}>
          {capturedTypes.map(coordinationType => (
            <Chip
              key={coordinationType}
              size="small"
              label={coordinationType}
              className={classes.capturedValueChip}
              onDelete={() => onRemoveValue(view.uid, coordinationType)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Capture the current coordination values of views into the active frame.
 * @param {object} props
 * @param {object} props.frame The active frame.
 * @param {object[]} props.views The annotatable views, as { uid, component }.
 * @param {function} props.onCapture Callback, called with (viewUid, coordinationTypes).
 * @param {function} props.onRemoveValue Callback, called with (viewUid, coordinationType).
 */
export function FrameCaptureEditor(props) {
  const {
    frame, views, onCapture, onRemoveValue,
  } = props;
  const { classes } = useStyles();
  // The user's selection of coordination types, per view uid.
  // Views which are not in this object use the default selection.
  const [selectedTypesByView, setSelectedTypesByView] = useState({});

  if (views.length === 0) {
    return (
      <div className={classes.hint}>
        No views with a uid support annotation frames.
      </div>
    );
  }

  return views.map(view => (
    <ViewCaptureEditor
      key={view.uid}
      view={view}
      frame={frame}
      selectedTypes={selectedTypesByView[view.uid] ?? getDefaultSelection(view.component)}
      onSelectedTypesChange={selectedTypes => setSelectedTypesByView(prev => ({
        ...prev, [view.uid]: selectedTypes,
      }))}
      onCapture={onCapture}
      onRemoveValue={onRemoveValue}
    />
  ));
}
