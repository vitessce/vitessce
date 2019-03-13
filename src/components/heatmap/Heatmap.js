import React from 'react';

export default class Heatmap extends React.Component {
  constructor(props) {
    super(props);

    this.radio = this.radio.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const { target } = event;
    const { name } = target;
    const { setSelectedFactor } = this.props;
    setSelectedFactor(name);
  }

  radio(name, value) {
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
      ([factorId, value]) => this.radio(factorId, value),
    );
    return (
      <React.Fragment>
        {radioButtons}
      </React.Fragment>
    );
  }
}
