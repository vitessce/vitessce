import React from 'react';

export default function ClosePane(props) {
  const { componentWillUnmount, childRef } = props;

  function onRemovePane(childEl) {
    if (!childEl) {
      throw new Error('Failed to close pane due to missing ref.');
    } else {
      childEl.current.parentNode.remove();
    }
    // called to unsubscribe components to pubsub
    if (componentWillUnmount) {
      componentWillUnmount();
    }
  }
  return (
    <button
      type="button"
      className="close-pane-button"
      onClick={() => { onRemovePane(childRef); }}
      title="close"
    >
      &#10006;
    </button>
  );
}
