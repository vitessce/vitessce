import React from 'react';

export default function Description(props) {
  const { description } = props;

  return (
    <div>
      <p className="details">{description}</p>
    </div>
  );
}
