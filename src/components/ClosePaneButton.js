import React from 'react';

export default function ClosePane(props) {
  const { removeGridComponent } = props;
  return (
    <button
      type="button"
      className="close-pane-button"
      onClick={() => { removeGridComponent(); }}
      title="close"
    >
      &#10006;
    </button>
  );
}
