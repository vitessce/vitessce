import React from 'react';

export function Warning(props) {
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
            <div className="card card-body my-2 tooltip-ancestor bg-primary">
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
