import React from 'react';
import PropTypes from 'prop-types';

export default function Tsne(props) {
  // The real business logic goes inside.
  return (
    <p>tsne placeholder: {props.value}</p>
  );
}

Tsne.propTypes = {
  value: PropTypes.string
}
