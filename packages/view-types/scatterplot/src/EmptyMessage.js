import React from 'react';

export default function EmptyMessage(props) {
  const {
    visible,
    message,
  } = props;
  return visible ? (
    <div>{message}</div>
  ) : null;
}
