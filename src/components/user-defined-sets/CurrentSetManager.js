import React from 'react';
import Sets from './sets';

export default class CurrentSetManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      setName: undefined,
    };

    this.startEditing = this.startEditing.bind(this);
    this.stopEditing = this.stopEditing.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getNextSetName() {
    const { sets } = this.props;
    const nextIndex = Array.from(sets.namedSets.keys()).length + 1;
    return `Set ${nextIndex}`;
  }

  startEditing(event) {
    event.preventDefault();
    this.setState({ isEditing: true, setName: this.getNextSetName() });
  }

  stopEditing() {
    this.setState({ isEditing: false, setName: undefined });
  }

  handleChange(event) {
    this.setState({ setName: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { isEditing, setName } = this.state;
    const { sets, onUpdateSets } = this.props;
    onUpdateSets(Sets.nameCurrentSet(sets, (isEditing ? setName : this.getNextSetName()), false));
    this.stopEditing();
  }

  render() {
    const { sets } = this.props;

    if (!sets || sets.currentSet.size === 0) {
      return (
        <table className="current-set-manager sets-manager-disabled">
          <tbody>
            <tr>
              <td className="set-name">
                    No current selection
              </td>
              <td />
              <td />
            </tr>
          </tbody>
        </table>
      );
    }

    const { setName, isEditing } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <table className="current-set-manager">
          <tbody>
            <tr>
              <td className="set-name">
                {isEditing
                  ? (<input type="text" value={setName} onChange={this.handleChange} />)
                  : (<input type="text" value={this.getNextSetName()} onFocus={this.startEditing} />)
                  }
              </td>
              <td>
                <button type="submit" className="set-item-button set-item-save">Save</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    );
  }
}
