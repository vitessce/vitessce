import { HuePicker } from 'react-color'
import React from 'react';

export default class ChannelColorSelector extends React.Component {

  constructor(props) {
    super(props);
    const { channel } = props
    this.channel = channel
    const initColor = {r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255}
    this.state = {colorValue: initColor}
    const colorObj = {}
    colorObj[channel] = Object.values(initColor)
    this.props.setColorValue(colorObj);
    this.handleColorChange = this.handleColorChange.bind(this);
  }

  handleColorChange(color, event) {
    const channelValue = {};
    channelValue[this.channel] = Object.values(color.rgb).slice(0,3);
    this.setState({colorValue: color });
    this.props.setColorValue(channelValue);
  }

  render(){
    const { colorValue } = this.state
    return(
      <React.Fragment>
        <div style={{margin: "auto", width: "75%"}}>
          <HuePicker
            onChange={this.handleColorChange}
            color={colorValue}
          />
        </div>
      </React.Fragment>
    )
  }
}
