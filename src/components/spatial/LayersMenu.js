import React from 'react';

export default class LayersMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const { target, name } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [name]: value,
    });
  }

  render() {
    return (
      <div className="ml-auto card p-2">
        <div><input type="checkbox" name="molecules" onChange={this.handleInputChange} value={this.state.molecules} /> Molecules</div>
        <div><input type="checkbox" name="cells" onChange={this.handleInputChange} value={this.state.cells} /> Cells</div>
        <div><input type="checkbox" name="imagery" onChange={this.handleInputChange} value={this.state.imagery} /> Imagery</div>
      </div>
    );
  }
}
