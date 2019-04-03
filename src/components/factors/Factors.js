import React from 'react';

export default class Factors extends React.Component {
  constructor(props) {
    super(props);

    this.Radio = this.Radio.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  static defaultProps = {
    clearPleaseWait: (layer) => { console.warn(`"clearPleaseWait" not provided; layer: ${layer}`); },
  };

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
    const { factorsSelected } = this.props;
    const radioButtons = Object.entries(factorsSelected).map(
      ([factorId, value]) => this.Radio(factorId, value),
    );
    return (
      <React.Fragment>
        {radioButtons}
      </React.Fragment>
    );
  }
}
