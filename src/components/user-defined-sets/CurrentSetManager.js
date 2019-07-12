import React from 'react';
import * as Sets from './sets';

const CURRENT_SELECTION = 'Current selection';

export default class CurrentSetManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      setName: '',
    };

    this.startEditing = this.startEditing.bind(this);
    this.stopEditing = this.stopEditing.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  startEditing(event) {
    event.preventDefault();
    const { sets } = this.props;
    const nextIndex = sets.namedSets.size + 1;
    this.setState({ isEditing: true, setName: `Set ${nextIndex}` });
  }

  stopEditing() {
    this.setState({ isEditing: false });
  }

  handleChange(event) {
    this.setState({ setName: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { setName } = this.state;
    const { sets, onUpdateSets } = this.props;
    onUpdateSets(Sets.nameCurrentSet(sets, setName, false));
    this.stopEditing();
  }

  // eslint-disable-next-line class-methods-use-this
  Disabled() {
    return (
      <tr>
        <td className="set-name">{CURRENT_SELECTION}</td>
        <td />
        <td />
      </tr>
    );
  }

  EnabledStatic() {
    return (
      <tr>
        <td className="set-name">{CURRENT_SELECTION}</td>
        <td />
        <td>
          <button type="button" className="set-item-button set-item-save" onClick={this.startEditing}>Save</button>
        </td>
      </tr>
    );
  }

  EnabledEditing() {
    const { setName } = this.state;
    return (
      <tr>
        <td className="set-name">
          <input type="text" value={setName} onChange={this.handleChange} />
        </td>
        <td>
          <button type="button" className="set-item-button set-item-cancel" onClick={this.stopEditing}>×</button>
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

    if (!sets || sets.currentSet.size === 0) {
      return (
        <table className="current-set-manager sets-manager-disabled">
          <tbody>
            {this.Disabled()}
          </tbody>
        </table>
      );
    }
    return (
      <form onSubmit={this.handleSubmit}>
        <table className="current-set-manager">
          <tbody>
            {isEditing
              ? this.EnabledEditing()
              : this.EnabledStatic()
            }
          </tbody>
        </table>
      </form>
    );
  }
}
