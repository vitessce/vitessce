import React from 'react';
import HeatmapCanvas from './HeatmapCanvas';

export default class Heatmap extends React.Component {
  constructor(props) {
    super(props);

    this.renderRadio = this.renderRadio.bind(this);
    this.renderCanvas = this.renderCanvas.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const { target } = event;
    const { name } = target;
    const { setSelectedFactor } = this.props;
    setSelectedFactor(name);
  }

  renderRadio(name, value) {
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
    const { factorsSelected } = this.props;
    const radioButtons = Object.entries(factorsSelected).map(
      ([factorId, value]) => this.renderRadio(factorId, value),
    );
    return (
      <React.Fragment>
        {radioButtons}
        <HeatmapCanvas />
      </React.Fragment>
    );
  }
}
