import React from 'react';

export default class LayersMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleInputChange = this.handleInputChange.bind(this);
    this.checkbox = this.checkbox.bind(this);
  }

  handleInputChange(event) {
    const { target, name } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [name]: value,
    });
  }

  checkbox(name) {
    return (
      <div>
        <input
          type="checkbox"
          name={name}
          onChange={this.handleInputChange}
          value={this.state[name]}
        />
        &nbsp;{name}
      </div>
    );
  }

  render() {
    return (
      <div className="ml-auto card p-2">
        {this.checkbox('molecules')}
        {this.checkbox('cells')}
        {this.checkbox('imagery')}
      </div>
    );
  }
}
