import React, { useState } from 'react';
import {
  Button,
  Checkbox,
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
 * The checkboxes are initialized with the coordination types that the frame
 * already defines for the view (or the default types, if none).
 * @param {object} props
 * @param {object} props.view The view definition, as { uid, component }.
 * @param {object} props.frame The active frame.
 * @param {function} props.onCapture Callback, called with (viewUid, coordinationTypes).
 */
function ViewCaptureEditor(props) {
  const { view, frame, onCapture } = props;
  const { classes } = useStyles();
  const [isAllTypesVisible, setIsAllTypesVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(() => {
    const capturedTypes = Object.keys(getFrameViewCoordinationValues(frame, view.uid))
      .filter(t => t !== CoordinationType.ANNOTATION_SHAPES);
    return capturedTypes.length > 0 ? capturedTypes : getDefaultSelection(view.component);
  });

  const capturableTypes = getCapturableCoordinationTypes(view.component);
  const defaultTypes = getDefaultSelection(view.component);
  // Show the default types, plus any other types which have been selected.
  const visibleTypes = isAllTypesVisible
    ? capturableTypes
    : capturableTypes.filter(t => defaultTypes.includes(t) || selectedTypes.includes(t));

  function toggleType(coordinationType) {
    setSelectedTypes(prev => (prev.includes(coordinationType)
      ? prev.filter(t => t !== coordinationType)
      : [...prev, coordinationType]));
  }

  return (
    <div className={classes.captureView}>
      <div className={classes.captureViewHeader}>
        <span className={classes.captureViewName}>{`${view.uid} (${view.component})`}</span>
        <Tooltip title="Save the current state of this view (for the checked coordination types) into this frame">
          <Button
            size="small"
            variant="outlined"
            className={classes.toolButton}
            startIcon={<CenterFocusStrong fontSize="inherit" />}
            onClick={() => onCapture(view.uid, selectedTypes)}
          >
            Capture
          </Button>
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
    </div>
  );
}

/**
 * Capture the current coordination values of views into the active frame.
 * @param {object} props
 * @param {object} props.frame The active frame.
 * @param {object[]} props.views The annotatable views, as { uid, component }.
 * @param {function} props.onCapture Callback, called with (viewUid, coordinationTypes).
 */
export function FrameCaptureEditor(props) {
  const { frame, views, onCapture } = props;
  const { classes } = useStyles();

  if (views.length === 0) {
    return (
      <div className={classes.hint}>
        No views with a uid support annotation frames.
      </div>
    );
  }

  return views.map(view => (
    <ViewCaptureEditor
      // Re-initialize the checkboxes when switching to a different frame.
      key={`${frame?.uid}-${view.uid}`}
      view={view}
      frame={frame}
      onCapture={onCapture}
    />
  ));
}
