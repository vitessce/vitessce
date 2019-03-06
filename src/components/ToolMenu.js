import React from 'react';
import PubSub from 'pubsub-js';

import { SELECTION_MODE_SET, POINT, RECT } from '../events';

function IconButton(props) {
  const {
    src, alt, onClick, isActive = false,
  } = props;
  const inactive = 'btn btn-outline-secondary mr-2 icon';
  const active = `${inactive} active`;
  return (
    <button
      className={isActive ? active : inactive}
      onClick={onClick}
      type="button"
    >
      <img src={src} alt={alt} />
    </button>
  );
}

export default class ToolMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeTool: POINT };
    this.activatePointMode = this.activatePointMode.bind(this);
    this.activateRectangleMode = this.activateRectangleMode.bind(this);
  }

  activatePointMode() {
    this.setState({ activeTool: POINT });
    PubSub.publish(SELECTION_MODE_SET, POINT);
  }

  activateRectangleMode() {
    this.setState({ activeTool: RECT });
    PubSub.publish(SELECTION_MODE_SET, RECT);
  }

  render() {
    const { activeTool } = this.state;
    return (
      <div style={{ zIndex: 1000 }}>
        <IconButton
          src="https://s3.amazonaws.com/vitessce-data/assets/material/near_me.svg"
          alt="pointer tool"
          onClick={this.activatePointMode}
          isActive={activeTool === POINT}
        />
        <IconButton
          src="https://s3.amazonaws.com/vitessce-data/assets/material/selection.svg"
          alt="select rectangle"
          onClick={this.activateRectangleMode}
          isActive={activeTool === RECT}
        />
      </div>
    );
  }
}
