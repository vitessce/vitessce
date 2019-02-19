import React from 'react';
import PropTypes from 'prop-types';

export default function Heatmap(props) {
  // The real business logic goes inside.
  return (
    <p>
heatmap placeholder:
      {props.value}
    </p>
  );
}

Heatmap.propTypes = {
  value: PropTypes.string,
};
