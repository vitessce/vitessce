import React from 'react';

import { SelectableScatterplotLayer } from '../../layers';
import { cellLayerDefaultProps, DEFAULT_COLOR } from '../utils';
import CellEmphasisSubscriber from '../CellEmphasisSubscriber';
import AbstractSelectableComponent from '../AbstractSelectableComponent';
import StatusTooltipSubscriber from '../StatusTooltipSubscriber';

/**
React component which renders a scatterplot from cell data, typically tSNE or PCA.
*/
export default class Scatterplot extends AbstractSelectableComponent {
  // These are called from superclass, so they need to belong to instance, I think.
  // eslint-disable-next-line class-methods-use-this
  getInitialViewState() {
    return {
      zoom: 2,
      offset: [0, 0], // Required: https://github.com/uber/deck.gl/issues/2580
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getCellCoords(cell) {
    return cell.mappings[this.props.mapping];
  }

  renderCellEmphasis(viewInfo, uuid) { // eslint-disable-line class-methods-use-this
    const {
      mapping,
    } = this.props;
    return (
      <CellEmphasisSubscriber uuid={uuid} mapping={mapping} viewInfo={viewInfo} />
    );
  }

  renderStatusTooltip(viewInfo, uuid) { // eslint-disable-line class-methods-use-this
    const {
      mapping,
    } = this.props;
    return (
      <StatusTooltipSubscriber uuid={uuid} mapping={mapping} viewInfo={viewInfo} />
    );
  }

  renderLayers() {
    const {
      cells = undefined,
      mapping,
      updateStatus = (message) => {
        console.warn(`Scatterplot updateStatus: ${message}`);
      },
      updateCellsSelection = (cellsSelection) => {
        console.warn(`Scatterplot updateCellsSelection: ${cellsSelection}`);
      },
      updateCellsHover = (hoverInfo) => {
        console.warn(`Scatterplot updateCellsHover: ${hoverInfo.cellId}`);
      },
      selectedCellIds = {},
    } = this.props;

    const layers = [];
    if (cells) {
      layers.push(
        new SelectableScatterplotLayer({
          id: 'scatterplot',
          isSelected: cellEntry => (
            Object.keys(selectedCellIds).length
              ? selectedCellIds[cellEntry[0]]
              : true // If nothing is selected, everything is selected.
          ),
          getRadius: 0.5,
          lineWidthMinPixels: 0.1,
          stroked: true,
          getPosition: (cellEntry) => {
            const mappedCell = cellEntry[1].mappings[mapping];
            return [mappedCell[0], mappedCell[1], 0];
          },
          getColor: cellEntry => (
            this.props.cellColors ? this.props.cellColors[cellEntry[0]] : DEFAULT_COLOR
          ),
          onClick: (info) => {
            const cellId = info.object[0];
            if (selectedCellIds[cellId]) {
              delete selectedCellIds[cellId];
              updateCellsSelection(selectedCellIds);
            } else {
              selectedCellIds[cellId] = true;
              updateCellsSelection(selectedCellIds);
            }
          },
          ...cellLayerDefaultProps(cells, updateStatus, updateCellsHover, this.uuid),
        }),
      );
    }

    return layers;
  }
}
