/* eslint-disable */
import React from 'react';
import PubSub from 'pubsub-js';

import { CELLS_HOVER, GENES_HOVER, VIEW_INFO } from '../../events';
import HeatmapTooltip from './HeatmapTooltip';
import CellTooltipContent from './CellTooltipContent';

export default class HeatmapTooltipSubscriber extends React.Component {
  constructor(props) {
    super(props);
    const { uuid } = props;
    this.state = {
      hoveredCellInfo: null,
      hoveredGeneInfo: null,
      viewInfo: null,
    };
    this.uuid = uuid;
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.cellsHoverToken = PubSub.subscribe(
      CELLS_HOVER, this.cellsHoverSubscriber.bind(this),
    );
    this.cellsHoverToken = PubSub.subscribe(
      GENES_HOVER, this.genesHoverSubscriber.bind(this),
    );
    this.viewInfoToken = PubSub.subscribe(
      VIEW_INFO, this.viewInfoSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsHoverToken);
    PubSub.unsubscribe(this.genesHoverToken);
    PubSub.unsubscribe(this.viewInfoToken);
  }

  cellsHoverSubscriber(msg, hoverInfo) {
    this.setState({ hoveredCellInfo: hoverInfo });
  }

  genesHoverSubscriber(msg, hoverInfo) {
    this.setState({ hoveredGeneInfo: hoverInfo });
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
    const { hoveredCellInfo, hoveredGeneInfo, viewInfo } = this.state;
    return (
      <HeatmapTooltip
        hoveredCellInfo={hoveredCellInfo}
        hoveredGeneInfo={hoveredGeneInfo}
        mapping={mapping}
        viewInfo={viewInfo}
        uuid={uuid}
      >
        {hoveredCellInfo && (
          <CellTooltipContent
            cellId={hoveredCellInfo.cellId}
            factors={hoveredCellInfo.factors}
          />
        )}
      </HeatmapTooltip>
    );
  }
}
