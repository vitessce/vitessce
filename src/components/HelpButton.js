import React from 'react';
import HelpIcon from '@material-ui/icons/Help';

export default function HelpButton(props) {
  const { setShowHelpInfo } = props;
  return (
    <button
      type="button"
      className="title-info-button"
      onClick={() => setShowHelpInfo(true)}
      title="close"
    >
      <HelpIcon />
    </button>
  );
}
