import React from 'react';
import { SCROLL_CARD, BLACK_CARD } from './classNames';
import componentCss from '../css/component.module.scss';

export default function TitleInfo(props) {
  const {
    title, info, children, isScroll,
  } = props;
  const childClassName = isScroll ? SCROLL_CARD : BLACK_CARD;
  const className = `${componentCss.title} d-flex justify-content-between align-items-baseline`;
  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <React.Fragment>
      <div
        className={className}
      >
        {title}
        <span className={`${componentCss.details} pl-2`}>{info}</span>
      </div>
      <div className={childClassName}>
        {children}
      </div>
    </React.Fragment>
    // "pl-2" only matters when the window is very narrow.
  );
}
