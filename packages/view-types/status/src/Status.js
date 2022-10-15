import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  info: {
    // details
    fontSize: '80%',
    opacity: '0.8',
  },
  warn: {
    // alert alert-warning my-0 details
    position: 'relative',
    padding: '0.75rem 1.25rem',
    border: '1px solid transparent',
    borderRadius: '0.25rem',

    color: '#856404',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',

    marginTop: '0',
    marginBottom: '0',
  },
}));

export default function Status(props) {
  const { info, warn } = props;
  const classes = useStyles();
  const messages = [];
  if (info) {
    messages.push(
      <p className={classes.info} key="info">
        {info}
      </p>,
    );
  }
  if (warn) {
    messages.push(
      <p className={clsx(classes.info, classes.warn)} key="warn">
        {warn}
      </p>,
    );
  }
  return messages;
}
