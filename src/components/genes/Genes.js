import React from 'react';

export default class Genes extends React.Component {
  constructor(props) {
    super(props);

    this.radio = this.radio.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const { target } = event;
    console.warn('TODO', this, target);
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
    const { genes } = this.props;
    const radioButtons = genes.map(geneId => this.radio(geneId, false));
    return (
      <React.Fragment>
        {radioButtons}
      </React.Fragment>
    );
  }
}
