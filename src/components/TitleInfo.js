import React from 'react';

export default function TitleInfo(props) {
  const { title, info } = props;
  return (
    <div className="title d-flex justify-content-between align-items-baseline">
      {title}
      <span className="details">({info})</span>
    </div>
  );
}
