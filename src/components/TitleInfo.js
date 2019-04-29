import React from 'react';

export default function TitleInfo(props) {
  const { title, info, children } = props;
  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <React.Fragment>
      <div
        className="title d-flex justify-content-between align-items-baseline"
      >
        {title}
        <span className="details pl-2">{info}</span>
      </div>
      {children}
    </React.Fragment>
    // "pl-2" only matters when the window is very narrow.
  );
}
