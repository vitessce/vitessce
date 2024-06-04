import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  description: {
    '& p, details, table': {
      fontSize: '80%',
      opacity: '0.8',
    },
    '& details': {
      marginBottom: '6px',
    },
    '& summary': {
      // TODO(monorepo): lighten color by 10%
      borderBottom: `1px solid ${theme.palette.primaryBackground}`,
      cursor: 'pointer',
    },
  },
}));

export default function OrganViewer(props) {
  const { description } = props;
  const classes = useStyles();
  return (
    <div className={classes.description}>
      <p>{description}</p>
    </div>
  );
}
