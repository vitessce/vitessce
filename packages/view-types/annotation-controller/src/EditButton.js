import React from 'react';
import {
  IconButton,
  Tooltip,
  Edit,
} from '@vitessce/styles';
import { useStyles } from './styles.js';

export function EditButton(props) {
  const { onClick } = props;
  const { classes } = useStyles();
  return (
    <Tooltip title="Edit the annotation story">
      <IconButton size="small" className={classes.subtleButton} onClick={onClick} aria-label="Edit the annotation story">
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
