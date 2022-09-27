import React from 'react';
import { PRIMARY_CARD } from '../components/classNames';

export default function Warning(props) {
  const {
    title,
    preformatted,
    unformatted,
    theme,
  } = props;
  return (
    <div className={`vitessce-container vitessce-theme-${theme}`}>
      <div className="warning-layout container-fluid">
        <div className="row">
          <div className="col-12">
            <div className={PRIMARY_CARD}>
              <h1>{title}</h1>
              <pre>{preformatted}</pre>
              <div>{unformatted}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
