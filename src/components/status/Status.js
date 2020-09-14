import React from 'react';

export default function Status(props) {
  const warnClass = 'alert alert-warning my-0 details';
  const { info, warn } = props;
  const messages = [];
  if (info) {
    messages.push(<p className="details" key="info">{info}</p>);
  }
  if (warn) {
    messages.push(<p className={warnClass} key="warn">{warn}</p>);
  }
  return (
    messages
  );
}
