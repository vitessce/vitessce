import React from 'react';
import clsx from 'clsx';
import { css } from '@mui/material-pigment-css';

const infoStyle = css({
  fontSize: '80%',
  opacity: '0.8',
});

const warnStyle = css({
  position: 'relative',
  padding: '12px 20px',
  border: '1px solid transparent',
  borderRadius: '4px',

  color: '#856404',
  backgroundColor: '#fff3cd',
  borderColor: '#ffeeba',

  marginTop: '0',
  marginBottom: '0',
});


export default function Status(props) {
  const { info, warn } = props;
  const messages = [];
  if (info) {
    messages.push(<p className={infoStyle} key="info">{info}</p>);
  }
  if (warn) {
    messages.push(<p className={clsx(infoStyle, warnStyle)} key="warn">{warn}</p>);
  }
  return (
    messages
  );
}
