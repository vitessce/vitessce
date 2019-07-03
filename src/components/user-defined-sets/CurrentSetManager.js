import React from 'react';

const CURRENT_SELECTION = 'Current selection';

export default function CurrentSetManager({ sets }) {
  if (!sets) {
    return (
      <table className="current-set-manager sets-manager-disabled">
        <tbody>
          <tr>
            <td className="set-name">{CURRENT_SELECTION}</td>
            <td className="small set-item-count">0</td>
          </tr>
        </tbody>
      </table>
    );
  }
  return (
    <table className="current-set-manager">
      <tbody>
        <tr>
          <td className="set-name">{CURRENT_SELECTION}</td>
          <td className="set-item-count">{sets.size}</td>
          <td><button className="set-item-save" onClick={}>Save</button></td>
        </tr>
      </tbody>
    </table>
  );
}
