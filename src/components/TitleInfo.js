import React from 'react';

export default function TitleInfo(props) {
  const { title, info } = props;
  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <div>
      <div
        className="title d-flex justify-content-between align-items-baseline"
      >
        {title}
        <span className="details">{info}</span>
      </div>
    </div>
  );
}
