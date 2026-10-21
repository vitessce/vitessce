import React, { useEffect, useState, useId } from 'react';
import { Checkbox, Slider, TableCell, TableRow } from '@vitessce/styles';
import { usePlotOptionsStyles, OptionsContainer } from '@vitessce/vit-s';

// Projection spacing slider on a log2 scale: 2^-4 = 0.0625 (NG minimum, all points) .. 2^4 = 16.
const MIN_EXP = -4;
const MAX_EXP = 4;
const toExp = v => Math.min(MAX_EXP, Math.max(MIN_EXP, Math.log2(v)));

function CheckboxRow({ label, checked, onChange, id, disabled = false }) {
  const { classes } = usePlotOptionsStyles();
  return (
    <TableRow>
      <TableCell className={classes.labelCell} variant="head" scope="row">
        <label htmlFor={id}>{label}</label>
      </TableCell>
      <TableCell className={classes.inputCell} variant="body">
        <Checkbox
          className={classes.checkbox}
          checked={checked}
          disabled={disabled}
          onChange={(e, v) => onChange(v)}
          color="default"
          slotProps={{ input: { id, 'aria-label': label } }}
        />
      </TableCell>
    </TableRow>
  );
}

function SliderRow({ label, id, children }) {
  const { classes } = usePlotOptionsStyles();
  return (
    <TableRow>
      <TableCell className={classes.labelCell} variant="head" scope="row">
        <label htmlFor={id}>{label}</label>
      </TableCell>
      <TableCell className={classes.inputCell} variant="body">
        {children}
      </TableCell>
    </TableRow>
  );
}

function PointLayerRows({ layer, baseId }) {
  const { classes } = usePlotOptionsStyles();
  const {
    label, spacing, setSpacing,
  } = layer;
  // Local state so dragging is smooth; spacing commits on release (may load finer chunks).
  const [exp, setExp] = useState(toExp(spacing ?? 1.0));
  useEffect(() => { setExp(toExp(spacing ?? 1.0)); }, [spacing]);
  const spacingId = `${baseId}-spacing`;

  return (
    <>
      {setSpacing ? (
        <SliderRow label={`${label} spacing (3D)`} id={spacingId}>
          <Slider
            slotProps={{
              root: { className: classes.slider },
              valueLabel: { className: classes.sliderValueLabel },
            }}
            value={exp}
            min={MIN_EXP}
            max={MAX_EXP}
            step={0.5}
            scale={x => 2 ** x}
            valueLabelDisplay="auto"
            valueLabelFormat={v => (v <= 0.0625 ? 'all' : v.toFixed(v < 1 ? 3 : 1))}
            onChange={(e, v) => setExp(v)}
            onChangeCommitted={(e, v) => setSpacing(2 ** v)}
            id={spacingId}
            aria-label={`${label} projection spacing (lower shows more points)`}
          />
        </SliderRow>
      ) : null}
    </>
  );
}

export default function NeuroglancerOptions(props) {
  const {
    axisLinesVisible,
    setAxisLinesVisible,
    boundsVisible,
    setBoundsVisible,
    pointLayers = [],
    orthographic,
    setOrthographic,
    scaleBarVisible,
    setScaleBarVisible,
    hideUnselected,
    setHideUnselected,
  } = props;
  const id = useId();

  return (
    <OptionsContainer>
      {setAxisLinesVisible ? (
        <CheckboxRow
          label="Axis lines"
          id={`ng-axis-lines-${id}`}
          checked={Boolean(axisLinesVisible)}
          onChange={setAxisLinesVisible}
        />
      ) : null}
      {setBoundsVisible ? (
        <CheckboxRow
          label="Bounds"
          id={`ng-bounds-${id}`}
          checked={Boolean(boundsVisible)}
          onChange={setBoundsVisible}
        />
      ) : null}
      {setOrthographic ? (
        <CheckboxRow
          label="Orthographic"
          id={`ng-ortho-${id}`}
          checked={Boolean(orthographic)}
          onChange={setOrthographic}
        />
      ) : null}
      {setScaleBarVisible ? (
        <CheckboxRow
          // Neuroglancer only draws the scale bar in orthographic projection.
          label="Scale bar"
          id={`ng-scale-bar-${id}`}
          checked={Boolean(scaleBarVisible) && Boolean(orthographic)}
          disabled={!orthographic}
          onChange={setScaleBarVisible}
        />
      ) : null}
      {pointLayers.map(layer => (
        <PointLayerRows key={layer.scope} layer={layer} baseId={`ng-points-${id}-${layer.scope}`} />
      ))}
      {setHideUnselected ? (
        <CheckboxRow
          // Applies when cells are colored by set selection and at least one set is selected.
          label="Hide unselected cells"
          id={`ng-hide-unselected-${id}`}
          checked={Boolean(hideUnselected)}
          onChange={setHideUnselected}
        />
      ) : null}
    </OptionsContainer>
  );
}
