import React from 'react';
import { LIGHT_CARD } from '../classNames';
import TitleInfo from '../TitleInfo';

export default function Status(props) {
  const infoClass = `${LIGHT_CARD} details`;
  const warnClass = 'alert alert-warning my-0 details';
  const { info, warn } = props;
  const messages = [];
  if (info) {
    messages.push(<p className={infoClass} key="info">{info}</p>);
  }
  if (warn) {
    console.warn(warn);
    messages.push(<p className={warnClass} key="warn">{warn}</p>);
  }
  return (
    <React.Fragment>
      <TitleInfo title="Status" />
      {messages}
    </React.Fragment>
  );
}
