import React from 'react';
import { useId } from 'react-aria';
import { OptionsContainer, OptionSelect, usePlotOptionsStyles } from '@vitessce/vit-s';
import { TableCell, TableRow } from '@vitessce/styles';

const OBS_SET_COLORMAP_OPTIONS = [
  ['default', 'Vitessce Default'],
  ['tolBright', 'Tol: Bright'],
  ['tolHighContrast', 'Tol: High Contrast'],
  ['tolVibrant', 'Tol: Vibrant'],
  ['tolMuted', 'Tol: Muted'],
  ['tolMediumContrast', 'Tol: Medium Contrast'],
  ['tolLight', 'Tol: Light'],
  ['tab10', 'Matplotlib: tab10'],
  ['set1', 'Matplotlib: Set1'],
  ['set2', 'Matplotlib: Set2'],
  ['set3', 'Matplotlib: Set3'],
  ['dark2', 'Matplotlib: Dark2'],
  ['accent', 'Matplotlib: Accent'],
  ['pastel1', 'Matplotlib: Pastel1'],
  ['pastel2', 'Matplotlib: Pastel2'],
];

export default function ObsSetsManagerOptions(props) {
  const { obsSetColormap, setObsSetColormap } = props;
  const colormapId = useId();
  const { classes } = usePlotOptionsStyles();

  function handleChange(event) {
    setObsSetColormap(event.target.value);
  }

  return (
    <OptionsContainer>
      <TableRow>
        <TableCell className={classes.labelCell} variant="head" scope="row">
          <label htmlFor={`obs-set-colormap-${colormapId}`}>Color Scale</label>
        </TableCell>
        <TableCell variant="body">
          <OptionSelect
            className={classes.select}
            value={obsSetColormap}
            onChange={handleChange}
            inputProps={{ id: `obs-set-colormap-${colormapId}` }}
          >
            {OBS_SET_COLORMAP_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </OptionSelect>
        </TableCell>
      </TableRow>
    </OptionsContainer>
  );
}




