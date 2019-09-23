import React from 'react';

export default function ClosePane(props) {
  const { gridItemId, componentWillUnmount } = props;
  function onRemovePane(id) {
    if (!id) {
      throw new Error('Failed to close pane due to missing id.');
    } else {
      document.getElementById(id).parentNode.remove();
    }
    // typically to unsubscribe components to pubsub
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
      &#10006;
    </button>
  );
}
