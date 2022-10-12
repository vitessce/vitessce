import React from 'react';

export function createWarningComponent(props) {
  // eslint-disable-next-line react/display-name
  return () => {
    const {
      title,
      message,
    } = props;
    return (
      <div>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    );
  };
}
