import React from 'react';

export default class Genes extends React.Component {
  constructor(props) {
    super(props);

    this.radio = this.radio.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const { target } = event;
    const { checked, name } = target;

    const { genesState, setGenesState } = this.props;
    genesState[name] = checked;
    setGenesState(genesState);
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
    const { genesState } = this.props;
    const radioButtons = Object.entries(genesState).map(
      ([geneId, value]) => this.radio(geneId, value),
    );
    return (
      <React.Fragment>
        {radioButtons}
      </React.Fragment>
    );
  }
}
