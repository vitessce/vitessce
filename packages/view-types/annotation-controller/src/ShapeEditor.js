import React, { useState } from 'react';
import {
  Button,
  NativeSelect,
  Slider,
  TextField,
} from '@vitessce/styles';
import { getMeasurementLabel } from '@vitessce/gl';
import { DEFAULT_SHAPE_STROKE_COLOR, DEFAULT_SHAPE_STROKE_WIDTH } from './story-utils.js';
import { useStyles } from './styles.js';

const FILLED_SHAPE_TYPES = ['rectangle', 'ellipse', 'polygon'];
const MARKER_SHAPE_TYPES = ['line', 'polyline'];

const DASH_OPTIONS = [
  { value: undefined, label: 'Solid' },
  { value: '8 4', label: 'Dash' },
  { value: '2 4', label: 'Dot' },
];

const MARKER_OPTIONS = [
  { value: undefined, label: 'None' },
  { value: 'Arrow', label: 'Arrow' },
  { value: 'Tick', label: 'Tick' },
];

const TEXT_POSITION_OPTIONS = ['start', 'middle', 'end'];

// The geometry fields of each shape type, grouped into rows of [label, [[field, label], ...]].
const GEOMETRY_FIELDS = {
  rectangle: [
    ['Origin', [['x', 'x'], ['y', 'y']]],
    ['Size', [['width', 'w'], ['height', 'h']]],
  ],
  line: [
    ['Start', [['x1', 'x'], ['y1', 'y']]],
    ['End', [['x2', 'x'], ['y2', 'y']]],
  ],
  ellipse: [
    ['Center', [['x1', 'x'], ['y1', 'y']]],
    ['Radius', [['radiusX', 'rx'], ['radiusY', 'ry']]],
  ],
};

function rgbToHex(rgb) {
  return `#${rgb.slice(0, 3)
    .map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0'))
    .join('')}`;
}

function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
    : DEFAULT_SHAPE_STROKE_COLOR;
}

function OptionButtons(props) {
  const { options, value, onChange } = props;
  const { classes } = useStyles();
  return (
    <div className={classes.buttonGroup}>
      {options.map(option => (
        <Button
          key={option.label}
          size="small"
          variant={value === option.value ? 'contained' : 'outlined'}
          className={classes.optionButton}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function NumberField(props) {
  const {
    label, value, onChange, min,
  } = props;
  const { classes } = useStyles();
  return (
    <>
      <span className={classes.coordinateLabel}>{label}</span>
      <TextField
        type="number"
        variant="standard"
        size="small"
        className={classes.numberInput}
        value={value ?? 0}
        slotProps={{ htmlInput: { step: 1, min, 'aria-label': label } }}
        onChange={(e) => {
          const nextValue = parseFloat(e.target.value);
          // Ignore intermediate input (e.g., "-" or "") which is not a number.
          if (Number.isFinite(nextValue)) {
            onChange(nextValue);
          }
        }}
      />
    </>
  );
}

/**
 * Editor for the properties of a single annotation shape.
 * Parent components should set `key={shape.uid}`, so that the local UI state
 * (e.g., whether the geometry fields are expanded) is reset when the shape changes.
 * @param {object} props
 * @param {object} props.shape The shape.
 * @param {string} props.viewType The view type in which the shape is rendered.
 * @param {object[]} props.frames The frames of the story (for copying the shape to a frame).
 * @param {number} props.frameIndex The index of the frame containing the shape.
 * @param {function} props.onUpdate Callback, called with the shape properties to update.
 * @param {function} props.onCopyToFrame Callback, called with the target frame index.
 */
export function ShapeEditor(props) {
  const {
    shape, viewType, frames, frameIndex, onUpdate, onCopyToFrame,
  } = props;
  const { classes } = useStyles();
  const [isGeometryOpen, setIsGeometryOpen] = useState(false);

  const hasFill = FILLED_SHAPE_TYPES.includes(shape.type);
  const hasMarkers = MARKER_SHAPE_TYPES.includes(shape.type);
  const strokeColor = shape.strokeColor ?? DEFAULT_SHAPE_STROKE_COLOR;
  const measurement = getMeasurementLabel(shape, null, viewType);
  const numDigits = String(frames.length).length;

  return (
    <div className={classes.shapeEditor}>
      <div className={classes.shapeEditorRow}>
        <span className={classes.shapeEditorLabel}>Label</span>
        <TextField
          value={shape.text ?? ''}
          onChange={e => onUpdate({ text: e.target.value || undefined })}
          size="small"
          variant="standard"
          placeholder="Label text"
          fullWidth
          slotProps={{ htmlInput: { className: classes.inputText, 'aria-label': 'Label text' } }}
        />
      </div>
      {shape.type === 'line' && shape.text ? (
        <div className={classes.shapeEditorRow}>
          <span className={classes.shapeEditorLabel}>Position</span>
          <OptionButtons
            options={TEXT_POSITION_OPTIONS.map(p => ({ value: p, label: p }))}
            value={shape.textPosition ?? 'start'}
            onChange={textPosition => onUpdate({ textPosition })}
          />
        </div>
      ) : null}
      <div className={classes.shapeEditorRow}>
        <span className={classes.shapeEditorLabel}>Stroke</span>
        <input
          type="color"
          className={classes.colorSwatch}
          value={rgbToHex(strokeColor)}
          onChange={e => onUpdate({ strokeColor: hexToRgb(e.target.value) })}
          aria-label="Stroke color"
        />
        <OptionButtons
          options={DASH_OPTIONS}
          value={shape.strokeDashArray === 'none' ? undefined : shape.strokeDashArray}
          onChange={strokeDashArray => onUpdate({ strokeDashArray })}
        />
      </div>
      <div className={classes.shapeEditorRow}>
        <span className={classes.shapeEditorLabel}>Width</span>
        <Slider
          size="small"
          min={1}
          max={10}
          step={1}
          value={shape.strokeWidth ?? DEFAULT_SHAPE_STROKE_WIDTH}
          onChange={(_, strokeWidth) => onUpdate({ strokeWidth })}
          valueLabelDisplay="auto"
          className={classes.annotationSlider}
          aria-label="Stroke width"
        />
      </div>
      {hasFill ? (
        <div className={classes.shapeEditorRow}>
          <span className={classes.shapeEditorLabel}>Fill</span>
          <input
            type="color"
            className={classes.colorSwatch}
            value={rgbToHex(shape.fillColor ?? strokeColor)}
            onChange={e => onUpdate({ fillColor: hexToRgb(e.target.value) })}
            aria-label="Fill color"
          />
          <Slider
            size="small"
            min={0}
            max={1}
            step={0.05}
            value={shape.fillOpacity ?? 0}
            onChange={(_, fillOpacity) => onUpdate({ fillOpacity })}
            valueLabelDisplay="auto"
            valueLabelFormat={v => v.toFixed(2)}
            className={classes.annotationSlider}
            aria-label="Fill opacity"
          />
        </div>
      ) : null}
      {hasMarkers ? (
        <>
          <div className={classes.shapeEditorRow}>
            <span className={classes.shapeEditorLabel}>Start</span>
            <OptionButtons
              options={MARKER_OPTIONS}
              value={shape.markerStart ?? undefined}
              onChange={markerStart => onUpdate({ markerStart })}
            />
          </div>
          <div className={classes.shapeEditorRow}>
            <span className={classes.shapeEditorLabel}>End</span>
            <OptionButtons
              options={MARKER_OPTIONS}
              value={shape.markerEnd ?? undefined}
              onChange={markerEnd => onUpdate({ markerEnd })}
            />
          </div>
        </>
      ) : null}
      <div className={classes.shapeEditorRow}>
        <button
          type="button"
          className={classes.toggleTextButton}
          onClick={() => setIsGeometryOpen(prev => !prev)}
          aria-expanded={isGeometryOpen}
        >
          {isGeometryOpen ? '▾' : '▸'} Geometry
        </button>
        <span className={classes.measurement}>{measurement}</span>
        {frames.length > 1 ? (
          <NativeSelect
            value=""
            className={classes.nativeSelect}
            onChange={(e) => {
              if (e.target.value !== '') {
                onCopyToFrame(Number(e.target.value));
              }
            }}
            inputProps={{ 'aria-label': 'Copy shape to frame' }}
          >
            <option value="">Copy to…</option>
            {frames.map((frame, i) => (i === frameIndex ? null : (
              <option key={frame.uid} value={i}>
                {`${String(i + 1).padStart(numDigits, '0')} ${frame.title ?? ''}`}
              </option>
            )))}
          </NativeSelect>
        ) : null}
      </div>
      {isGeometryOpen ? (
        <>
          {(GEOMETRY_FIELDS[shape.type] || []).map(([rowLabel, fields]) => (
            <div className={classes.shapeEditorRow} key={rowLabel}>
              <span className={classes.shapeEditorLabel}>{rowLabel}</span>
              {fields.map(([field, fieldLabel]) => (
                <NumberField
                  key={field}
                  label={fieldLabel}
                  value={shape[field]}
                  min={['width', 'height', 'radiusX', 'radiusY'].includes(field) ? 0 : undefined}
                  onChange={value => onUpdate({ [field]: value })}
                />
              ))}
            </div>
          ))}
          {shape.points ? (
            <div className={classes.shapeEditorRow}>
              <span className={classes.shapeEditorLabel}>Points</span>
              <span className={classes.measurement}>{`${shape.points.length} vertices`}</span>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
