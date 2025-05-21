import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@vitessce/styles';

const useStyles = makeStyles()(() => ({
  info: {
    // details
    fontSize: '80%',
    opacity: '0.8',
  },
  warn: {
    // alert alert-warning my-0 details
    position: 'relative',
    padding: '12px 20px',
    border: '1px solid transparent',
    borderRadius: '4px',

    color: '#856404',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',

    marginTop: '0',
    marginBottom: '0',
  },
}));

export default function Status(props) {
  const { info, warn } = props;
  const { classes } = useStyles();
  const messages = [];
  if (info) {
    messages.push(<p className={classes.info} key="info">{info}</p>);
  }
  if (warn) {
    messages.push(<p className={clsx(classes.info, classes.warn)} key="warn">{warn}</p>);
  }
  return (
    messages
  );
}
