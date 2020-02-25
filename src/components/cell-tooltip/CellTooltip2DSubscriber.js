import React from 'react';
import PubSub from 'pubsub-js';

import { CELLS_HOVER, VIEW_INFO } from '../../events';
import CellTooltip2D from './CellTooltip2D';

export default class CellTooltip2DSubscriber extends React.Component {
  constructor(props) {
    super(props);
    const { uuid } = props;
    this.state = {
      hoveredCellInfo: null,
      viewInfo: null,
    };
    this.uuid = uuid;
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
    const { uuid } = this;
    // Only use the viewInfo if it corresponds to the view associated with the tooltip.
    if (viewInfo && viewInfo.uuid && uuid === viewInfo.uuid) {
      this.setState({ viewInfo });
    }
  }

  render() {
    const { mapping, uuid } = this.props;
    const { hoveredCellInfo, viewInfo } = this.state;
    return (
      <CellTooltip2D
        hoveredCellInfo={hoveredCellInfo}
        mapping={mapping}
        viewInfo={viewInfo}
        uuid={uuid}
      />
    );
  }
}
