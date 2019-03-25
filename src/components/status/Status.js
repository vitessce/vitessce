import React from 'react';
import { LIGHT_CARD } from '../classNames';

export default function Status(props) {
  const infoClass = LIGHT_CARD;
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
