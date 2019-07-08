import React from 'react';
import radioCss from '../../css/radio.module.css';

export default class Factors extends React.Component {
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
          className={radioCss.radio}
          name={name}
          onChange={this.handleInputChange}
          checked={value}
        />
        &nbsp;{name}
      </div>
    );
  }

  render() {
    const { factorsSelected, clearPleaseWait } = this.props;
    if (clearPleaseWait && factorsSelected) {
      clearPleaseWait('factors');
    }
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
