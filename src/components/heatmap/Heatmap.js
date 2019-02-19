import React from 'react';
import PropTypes from 'prop-types';

export default function Heatmap(props) {
  // The real business logic goes inside.
  const { value } = props;
  return (
    <p>
      heatmap placeholder:
      {value}
    </p>
  );
}

Heatmap.propTypes = {
  value: PropTypes.string,
};
