import React from 'react';

const CURRENT_SELECTION = 'Current selection';

export default class CurrentSetManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      setName: '',
    };

    this.startEditing = this.startEditing.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  startEditing() {
    const { sets } = this.props;
    this.setState({ isEditing: true, setName: `Set ${sets.size + 1}` });
  }

  cancelEditing() {
    this.setState({ isEditing: false, setName: '' });
  }

  handleChange(event) {
    this.setState({ setName: event.target.value });
  }

  handleSubmit(event) {
    console.log(this.state.setName);
    event.preventDefault();
  }

  // eslint-disable-next-line class-methods-use-this
  renderDisabled() {
    return (
      <table className="current-set-manager sets-manager-disabled">
        <tbody>
          <tr>
            <td className="set-name">{CURRENT_SELECTION}</td>
            <td className="small set-item-count">0</td>
            <td />
          </tr>
        </tbody>
      </table>
    );
  }

  renderEnabledStatic() {
    const { sets } = this.props;
    return (
      <tr>
        <td className="set-name">{CURRENT_SELECTION}</td>
        <td className="set-item-count">{sets.size}</td>
        <td>
          <button type="button" className="set-item-button set-item-save" onClick={this.startEditing}>Save</button>
        </td>
      </tr>
    );
  }

  renderEnabledEditing() {
    const { setName } = this.state;
    return (
      <tr>
        <td className="set-name">
          <input type="text" value={setName} onChange={this.handleChange} />
        </td>
        <td className="set-item-count">
          <button type="button" className="set-item-button set-item-cancel" onClick={this.cancelEditing}>×</button>
        </td>
        <td>
          <button type="submit" className="set-item-button set-item-save">Save</button>
        </td>
      </tr>
    );
  }

  render() {
    const { sets } = this.props;
    const { isEditing } = this.state;

    if (!sets || sets.size === 0) {
      return (
        <table className="current-set-manager sets-manager-disabled">
          <tbody>
            {this.renderDisabled()}
          </tbody>
        </table>
      );
    }
    return (
      <form onSubmit={this.handleSubmit}>
        <table className="current-set-manager">
          <tbody>
            {isEditing
              ? this.renderEnabledEditing()
              : this.renderEnabledStatic()
            }
          </tbody>
        </table>
      </form>
    );
  }
}
