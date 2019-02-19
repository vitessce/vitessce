import React from 'react';

export default function Status(props) {
  const url = 'https://github.com/hms-dbmi/vitessce-data/tree/master/fake-files/output-expected';
  const infoClass = 'alert alert-info my-0';
  const warningClass = 'alert alert-warning my-0';
  const { message, warn } = props;
  return message
    ? <p className={warn ? warningClass : infoClass}>{message}</p>
    : (
      <p className={infoClass}>
        Sample data is available
        <a href={url}>here</a>.
      </p>
    );
}
