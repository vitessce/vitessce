import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  CenterFocusStrong,
  ExpandLess,
  ExpandMore,
} from '@vitessce/styles';
import { CoordinationType } from '@vitessce/constants-internal';
import {
  getCaptureCategories,
  getDefaultCaptureCoordinationTypes,
} from './capture-utils.js';
import { getFrameViewCoordinationValues } from './story-utils.js';
import { useStyles } from './styles.js';

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
 * A checkbox for a category of coordination types,
 * which can be expanded to show a checkbox for each of its coordination types.
 * @param {object} props
 * @param {object} props.category The category, as { key, label, coordinationTypes }.
 * @param {string[]} props.selectedTypes The selected coordination types.
 * @param {function} props.onToggleType Callback, called with a coordination type.
 * @param {function} props.onCategoryChange Callback, called with (coordinationTypes, isChecked).
 */
function CaptureCategoryCheckbox(props) {
  const {
    category, selectedTypes, onToggleType, onCategoryChange,
  } = props;
  const { classes } = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);

  const { label, coordinationTypes } = category;
  const numSelected = coordinationTypes.filter(t => selectedTypes.includes(t)).length;
  const isChecked = numSelected === coordinationTypes.length;
  const isIndeterminate = numSelected > 0 && !isChecked;

  return (
    <div className={classes.captureCategory}>
      <div className={classes.captureCategoryHeader}>
        <FormControlLabel
          className={classes.captureCategoryLabel}
          control={(
            <Checkbox
              size="small"
              className={classes.captureTypeCheckbox}
              checked={isChecked}
              indeterminate={isIndeterminate}
              onChange={() => onCategoryChange(coordinationTypes, !isChecked)}
            />
          )}
          label={`${label} (${numSelected}/${coordinationTypes.length})`}
        />
        <IconButton
          size="small"
          className={classes.smallIconButton}
          onClick={() => setIsExpanded(prev => !prev)}
          aria-label={isExpanded ? `Hide ${label} types` : `Show ${label} types`}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ExpandLess fontSize="inherit" /> : <ExpandMore fontSize="inherit" />}
        </IconButton>
      </div>
      {isExpanded ? (
        <div className={classes.captureTypeList}>
          {coordinationTypes.map(coordinationType => (
            <CaptureTypeCheckbox
              key={coordinationType}
              coordinationType={coordinationType}
              isChecked={selectedTypes.includes(coordinationType)}
              onToggle={onToggleType}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Get the initial selection of coordination types for a view:
 * the coordination types that the frame already defines for the view
 * (or the default types, if none).
 * @param {object} frame The active frame.
 * @param {object} view The view definition, as { uid, component }.
 * @returns {string[]} The coordination types.
 */
function getInitialSelectedTypes(frame, view) {
  const capturedTypes = Object.keys(getFrameViewCoordinationValues(frame, view.uid))
    .filter(t => t !== CoordinationType.ANNOTATION_SHAPES);
  return capturedTypes.length > 0
    ? capturedTypes
    : getDefaultCaptureCoordinationTypes(view.component);
}

/**
 * Capture the current coordination values of one view into the active frame.
 * @param {object} props
 * @param {object} props.view The view definition, as { uid, component }.
 * @param {string[]} props.selectedTypes The coordination types to capture.
 * @param {function} props.onSelectedTypesChange Callback, called with a function
 * which receives the previous selected types and returns the new selected types.
 * @param {function} props.onCapture Callback, called with no arguments.
 */
function ViewCaptureEditor(props) {
  const {
    view, selectedTypes, onSelectedTypesChange, onCapture,
  } = props;
  const { classes } = useStyles();

  const categories = getCaptureCategories(view.component);

  function toggleType(coordinationType) {
    onSelectedTypesChange(prev => (prev.includes(coordinationType)
      ? prev.filter(t => t !== coordinationType)
      : [...prev, coordinationType]));
  }

  function setCategoryChecked(coordinationTypes, isChecked) {
    onSelectedTypesChange(prev => (isChecked
      ? [...new Set([...prev, ...coordinationTypes])]
      : prev.filter(t => !coordinationTypes.includes(t))));
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
            onClick={onCapture}
          >
            Capture
          </Button>
        </Tooltip>
      </div>
      <div className={classes.captureCategoryList}>
        {categories.map(category => (
          <CaptureCategoryCheckbox
            key={category.key}
            category={category}
            selectedTypes={selectedTypes}
            onToggleType={toggleType}
            onCategoryChange={setCategoryChecked}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Capture the current coordination values of views into the active frame.
 * @param {object} props
 * @param {object} props.frame The active frame.
 * @param {object[]} props.views The annotatable views, as { uid, component }.
 * @param {function} props.onCapture Callback, called with an object
 * mapping view uids to the coordination types to capture.
 */
export function FrameCaptureEditor(props) {
  const { frame, views, onCapture } = props;
  const { classes } = useStyles();
  // The user's selection of coordination types per view uid, for the frame with frameUid.
  // Views which are not in byView use their initial selection.
  // The selection is reset when switching to a different frame.
  const [selection, setSelection] = useState({ frameUid: frame?.uid, byView: {} });
  const selectedTypesByView = selection.frameUid === frame?.uid ? selection.byView : {};

  function getSelectedTypes(view) {
    return selectedTypesByView[view.uid] ?? getInitialSelectedTypes(frame, view);
  }

  function updateSelectedTypes(view, updater) {
    setSelection({
      frameUid: frame?.uid,
      byView: {
        ...selectedTypesByView,
        [view.uid]: updater(getSelectedTypes(view)),
      },
    });
  }

  if (views.length === 0) {
    return (
      <div className={classes.hint}>
        No views with a uid support annotation frames.
      </div>
    );
  }

  return (
    <>
      <div className={classes.captureAllRow}>
        <Tooltip title="Save the current state of all views (for their checked coordination types) into this frame">
          <Button
            size="small"
            variant="outlined"
            className={classes.toolButton}
            startIcon={<CenterFocusStrong fontSize="inherit" />}
            onClick={() => onCapture(Object.fromEntries(
              views.map(view => [view.uid, getSelectedTypes(view)]),
            ))}
          >
            Capture all
          </Button>
        </Tooltip>
      </div>
      {views.map(view => (
        <ViewCaptureEditor
          key={view.uid}
          view={view}
          selectedTypes={getSelectedTypes(view)}
          onSelectedTypesChange={updater => updateSelectedTypes(view, updater)}
          onCapture={() => onCapture({ [view.uid]: getSelectedTypes(view) })}
        />
      ))}
    </>
  );
}
