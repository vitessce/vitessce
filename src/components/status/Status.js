import React from 'react';
import TitleInfo from '../TitleInfo';
import componentCss from '../../css/component.module.scss';

export default function Status(props) {
  const warnClass = 'alert alert-warning my-0 details';
  const { info, warn } = props;
  const messages = [];
  if (info) {
    messages.push(<p className={componentCss.details} key="info">{info}</p>);
  }
  if (warn) {
    console.warn(warn);
    messages.push(<p className={warnClass} key="warn">{warn}</p>);
  }
  return (
    <TitleInfo title="Status" isScroll>
      {messages}
    </TitleInfo>
  );
}
