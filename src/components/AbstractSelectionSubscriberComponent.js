import React from 'react';
import { POINT, RECT } from '../events';

export default class AbstractSelectionSubscriberComponent extends React.Component {
  /* eslint-disable react/no-unused-state */
  // Concrete subclasses use state.
  selectionModeSetSubscriber(msg, mode) {
    if (mode === POINT) {
      this.setState({ isRectangleSelection: false });
    } else if (mode === RECT) {
      this.setState({ isRectangleSelection: true });
    } else {
      throw new Error(`Unrecognized mode: ${mode}`);
    }
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }
}
