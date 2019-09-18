import React from 'react';

import CloseSVG from '../assets/main/close.svg';

export default function ClosePane(props) {
  const { name, componentWillUnmount } = props;

  function onRemovePane(id) {
    document.getElementById(id).parentNode.remove();
    if (componentWillUnmount) {
      componentWillUnmount();
    }
  }

  return (
    <React.Fragment>
      <i
        className="anticon"
        onClick={() => { onRemovePane(name); }}
        title="close"
      >
        <CloseSVG />
      </i>
    </React.Fragment>
  );
}
