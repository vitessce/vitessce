import React from 'react';

export default function ClosePane(props) {
  const { gridItemId, componentWillUnmount } = props;

  function onRemovePane(id) {
    document.getElementById(id).parentNode.remove();
    if (componentWillUnmount) {
      componentWillUnmount();
    }
  }

  return (
    <button
      type="button"
      className="close-pane-button"
      onClick={() => { onRemovePane(gridItemId); }}
      title="close"
    >
      &#x00D7;
    </button>
  );
}
