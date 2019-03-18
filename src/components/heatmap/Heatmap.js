import React from 'react';
import HeatmapCanvas from './HeatmapCanvas';

export default class Heatmap extends React.Component {
  constructor(props) {
    super(props);

    this.Radio = this.Radio.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const { target } = event;
    const { name } = target;
    const { setSelectedFactor } = this.props;
    setSelectedFactor(name);
  }

  Radio(name, value) {
    return (
      <div key={name}>
        <input
          type="radio"
          name={name}
          onChange={this.handleInputChange}
          checked={value}
        />
        &nbsp;{name}
      </div>
    );
  }

  render() {
    const { factorsSelected, clusters } = this.props;
    const radioButtons = Object.entries(factorsSelected).map(
      ([factorId, value]) => this.Radio(factorId, value),
    );
    return (
      <React.Fragment>
        {radioButtons}
        <HeatmapCanvas clusters={clusters} />
      </React.Fragment>
    );
  }
}
