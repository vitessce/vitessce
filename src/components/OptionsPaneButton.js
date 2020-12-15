import React from 'react';
import SettingsIcon from '@material-ui/icons/Settings';

export default function OptionsPaneButton(props) {
  const { onClick } = props;
  return (
    <button
      type="button"
      className="title-pane-button"
      onClick={onClick}
      title="options"
    >
      <SettingsIcon />
    </button>
  );
}
