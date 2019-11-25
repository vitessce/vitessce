import React from 'react';

export default function ClosePane(props) {
  const { componentWillUnmount, titleRef } = props;

  function onRemovePane(titleElement) {
    if (!titleElement) {
      throw new Error('Failed to close pane due to missing ref.');
    } else {
      titleElement.current.parentNode.remove();
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
      onClick={() => { onRemovePane(titleRef); }}
      title="close"
    >
      &#10006;
    </button>
  );
}
