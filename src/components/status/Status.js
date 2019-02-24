import React from 'react';

export default function Status(props) {
  const infoClass = 'alert alert-info my-0';
  const warnClass = 'alert alert-warning my-0';
  const { info, warn } = props;
  const messages = [];
  if (info) {
    messages.push(<p className={infoClass} key="info">{info}</p>);
  }
  if (warn) {
    console.warn(warn);
    messages.push(<p className={warnClass} key="warn">{warn}</p>);
  }
  return (<React.Fragment>{messages}</React.Fragment>);
}
