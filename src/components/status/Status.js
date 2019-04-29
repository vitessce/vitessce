import React from 'react';
import { SCROLL_CARD } from '../classNames';
import TitleInfo from '../TitleInfo';

export default function Status(props) {
  const warnClass = 'alert alert-warning my-0 details';
  const { info, warn } = props;
  const messages = [];
  if (info) {
    messages.push(<p className="details" key="info">{info}</p>);
  }
  if (warn) {
    console.warn(warn);
    messages.push(<p className={warnClass} key="warn">{warn}</p>);
  }
  return (
    <TitleInfo title="Status">
      <div className={SCROLL_CARD}>
        {messages}
      </div>
    </TitleInfo>
  );
}
