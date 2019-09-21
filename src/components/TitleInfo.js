import React from 'react';
import uuidv4 from 'uuid/v4';
import { SCROLL_CARD, BLACK_CARD } from './classNames';
import ClosePane from './ClosePane';

export default function TitleInfo(props) {
  const {
    title, info, children, isScroll, componentWillUnmount,
  } = props;
  const childClassName = isScroll ? SCROLL_CARD : BLACK_CARD;
  const gridItemId = uuidv4();
  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <React.Fragment>
      <div
        id={gridItemId}
        className="title d-flex justify-content-between align-items-baseline"
      >
        {title}
        <span className="details pl-2">
          {info}&nbsp;
          <ClosePane gridItemId={gridItemId} componentWillUnmount={componentWillUnmount} />
        </span>
      </div>
      <div className={childClassName}>
        {children}
      </div>
    </React.Fragment>
    // "pl-2" only matters when the window is very narrow.
  );
}
