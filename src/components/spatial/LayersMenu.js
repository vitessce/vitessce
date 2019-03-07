import React from 'react';

export default class LayersMenu extends React.Component {
  constructor(props) {
    super(props);

    this.checkbox = this.checkbox.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    console.log('handle', event);
    const { target } = event;
    const { checked, name } = target;
    // In the future?: target.type === 'checkbox' ? target.checked : target.value;

    const { layersState, setLayersState } = this.props;
    layersState[name] = checked;
    setLayersState(layersState);
  }

  checkbox(name, value) {
    console.log(name, value);
    return (
      <div key={name}>
        <input
          type="checkbox"
          name={name}
          onChange={this.handleInputChange}
          checked={value}
        />
        &nbsp;{name}
      </div>
    );
  }

  render() {
    console.log('RENDER!!!');
    const { layersState } = this.props;
    const entries = Object.entries(layersState);
    const checkboxes = entries.map(([name, value]) => this.checkbox(name, value));
    return (
      <div className="ml-auto card p-2">
        {checkboxes}
      </div>
    );
  }
}
