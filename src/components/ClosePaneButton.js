import React from 'react';
import CloseIcon from '@material-ui/icons/Close';

export default function ClosePane(props) {
  const { removeGridComponent } = props;
  return (
    <button
      type="button"
      className="title-pane-button"
      onClick={() => { removeGridComponent(); }}
      title="close"
    >
      <CloseIcon />
    </button>
  );
}
