import React from 'react';
import CloseIcon from '@material-ui/icons/Close';

export default function ClosePaneButton(props) {
  const { removeGridComponent } = props;
  return (
    <button
      type="button"
      className="title-info-button"
      onClick={removeGridComponent}
      title="close"
    >
      <CloseIcon />
    </button>
  );
}
