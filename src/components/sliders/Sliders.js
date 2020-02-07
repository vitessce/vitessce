import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';

export default class Sliders extends React.Component {

  constructor(props) {
    super(props);
    this.handleSliderChange = this.handleSliderChange.bind(this);
  }

  handleSliderChange(event, value, channel) {
    var channelValue = {};
    channelValue[channel] = value;
    this.props.setSliderValue(channelValue);
  }

  render(){
    const { sliderValues, colorOptions, clearPleaseWait } = this.props;
    return(
      <React.Fragment>
        {
          Object.keys(sliderValues).map((channel, i) => {
            const ChannelSlider = withStyles({
              root: {
                color: `rgb(${colorOptions[channel]})`
              }
            })(Slider);
            return (
              <div key={`container-${channel}`}>
                <p>{channel}</p>
                <ChannelSlider
                  value={sliderValues[channel]}
                  onChange={(e, v) => this.handleSliderChange(e, v, channel)}
                  valueLabelDisplay="auto"
                  getAriaLabel={() => channel}
                  min={0}
                  max={this.props.max}
                  orientation="horizontal"
                />
              </div>
          );
        })
      }
      </React.Fragment>
    )
  }
}
