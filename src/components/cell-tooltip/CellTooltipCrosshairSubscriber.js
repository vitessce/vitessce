import React from 'react';
import PubSub from 'pubsub-js';

import { CELLS_HOVER, VIEW_INFO } from '../../events';
import CellTooltipCrosshair from './CellTooltipCrosshair';

export default class CellTooltipCrosshairSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredCellInfo: null,
      viewInfo: null,
    };
  }

  componentWillMount() {
    this.cellsHoverToken = PubSub.subscribe(
      CELLS_HOVER, this.cellsHoverSubscriber.bind(this),
    );
    this.viewInfoToken = PubSub.subscribe(
      VIEW_INFO, this.viewInfoSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsHoverToken);
    PubSub.unsubscribe(this.viewInfoToken);
  }

  cellsHoverSubscriber(msg, hoverInfo) {
    this.setState({ hoveredCellInfo: hoverInfo });
  }

  viewInfoSubscriber(msg, viewInfo) {
    const { uuid } = this.props;
    // Only use the viewInfo if it corresponds to the view associated with the tooltip.
    if (viewInfo && viewInfo.uuid && uuid === viewInfo.uuid) {
      this.setState({ viewInfo });
    }
  }

  render() {
    const {
      mapping,
      uuid,
    } = this.props;
    const {
      hoveredCellInfo,
      viewInfo,
    } = this.state;
    return (
      <CellTooltipCrosshair
        hoveredCellInfo={hoveredCellInfo}
        mapping={mapping}
        viewInfo={viewInfo}
        uuid={uuid}
      />
    );
  }
}
