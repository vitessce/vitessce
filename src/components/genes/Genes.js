import React from 'react';
import radioCss from '../../css/radio.module.css';

export default class Genes extends React.Component {
  constructor(props) {
    super(props);

    this.Radio = this.Radio.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const { target } = event;
    const { name } = target;
    const { setSelectedGene } = this.props;
    setSelectedGene(name);
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
    const { genesSelected, clearPleaseWait } = this.props;
    if (clearPleaseWait && genesSelected) {
      clearPleaseWait('genes');
    }
    const radioButtons = Object.entries(genesSelected).sort(
      (a, b) => a[0].localeCompare(b[0]),
    ).map(
      ([geneId, value]) => this.Radio(geneId, value),
    );
    return (
      <React.Fragment>
        {radioButtons}
      </React.Fragment>
    );
  }
}
