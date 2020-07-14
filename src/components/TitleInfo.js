import React from 'react';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { SCROLL_CARD, BLACK_CARD, SECONDARY_CARD } from './classNames';
import ClosePaneButton from './ClosePaneButton';

export default function TitleInfo(props) {
  const {
    title, info, children, isScroll, isSpatial, removeGridComponent, urls,
  } = props;
  // eslint-disable-next-line no-nested-ternary
  const childClassName = isScroll ? SCROLL_CARD : (isSpatial ? BLACK_CARD : SECONDARY_CARD);
  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <>
      <div className="title d-flex justify-content-between align-items-baseline">
        <div className="justify-content-between d-flex align-items-end">
          <span>{title}</span>
          { urls ? <CloudDownloadIcon style={{ marginLeft: '8px' }} /> : null }
        </div>
        <span className="details pl-2 align-items-end">
          <span className="d-flex justify-content-between">
            {info}
            <ClosePaneButton removeGridComponent={removeGridComponent} />
          </span>
        </span>
      </div>
      <div className={childClassName}>{children}</div>
    </>
    // "pl-2" only matters when the window is very narrow.
  );
}
