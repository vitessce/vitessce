import React from 'react';

export default class LayersMenu extends React.Component {
  constructor(props) {
    super(props);

    this.checkbox = this.checkbox.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const { target } = event;
    const { checked, name } = target;
    // In the future?: target.type === 'checkbox' ? target.checked : target.value;

    const { layerIsVisible, setLayerIsVisible } = this.props;
    layerIsVisible[name] = checked;
    setLayerIsVisible(layerIsVisible);
  }

  checkbox(name, value) {
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
    const { layerIsVisible } = this.props;
    const entries = Object.entries(layerIsVisible);
    const checkboxes = entries.map(([name, value]) => this.checkbox(name, value));
    return (
      <div className="ml-auto card p-2 tool roll-up">
        <div>Layers ▼</div>
        {checkboxes}
      </div>
    );
  }
}
