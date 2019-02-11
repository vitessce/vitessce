import React from 'react';
import PropTypes from 'prop-types';

function IconButton(props) {
  const {src, alt, onClick, isActive=false} = props;
  const inactive = 'btn btn-outline-secondary mr-2 icon'
  const active = inactive +  ' active';
  return (
    <button
      className={isActive ? active : inactive}
      onClick={onClick}
    >
      <img src={src} alt={alt}/>
    </button>
  );
}

IconButton.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  onClick: PropTypes.func,
  isActive: PropTypes.bool
}

const POINT = 'point';
const RECT = 'rect';

export class ToolPicker extends React.Component {

  constructor(props) {
    super(props);
    this.state = {activeTool: POINT};
    this.activatePointMode = this.activatePointMode.bind(this);
    this.activateRectangleMode = this.activateRectangleMode.bind(this);
  }

  // componentWillMount() {
  //   this.warnToken = PubSub.subscribe(STATUS_WARN, this.warnSubscriber.bind(this));
  // }

  // componentWillUnmount() {
  //   PubSub.unsubscribe(this.warnToken);
  // }

  // warnSubscriber(msg, data) {
  //   this.setState({warn: true, message: data});
  // }

  activatePointMode() {
    this.setState({activeTool: POINT});
    console.log('point!');
  }

  activateRectangleMode() {
    this.setState({activeTool: RECT});
    console.log('rect!');
  }

  render() {
    return (
      <div>
        <IconButton
          src="inkscape/tool_pointer.svg"
          alt="pointer tool"
          onClick={this.activatePointMode}
          isActive={this.state.activeTool === POINT}
        />
        <IconButton
          src="inkscape/snap_bounding_box_center.svg"
          alt="select rectangle"
          onClick={this.activateRectangleMode}
          isActive={this.state.activeTool === RECT}
        />
      </div>
    );
  }
}
