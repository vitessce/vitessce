import React from 'react';
import PropTypes from 'prop-types';

export default function Status(props) {
  return props.message
    ? <p className={props.warn ? 'alert alert-warning' : ''}>{props.message}</p>
    : <p className='alert alert-info'>Sample data is available <a href='https://github.com/hms-dbmi/vitessce-data/tree/master/fake-files/output-expected'>here</a>.</p>;
}

Status.propTypes = {
  message: PropTypes.string,
  warn: PropTypes.boolean
}
