import { SelectableScatterplotLayer } from '../../layers';
import { cellLayerDefaultProps, DEFAULT_COLOR } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';

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
    return cell.mappings.tsne;
    // TODO: Make generic.
    // TODO: Check if it's even needed?
  }

  renderLayers() {
    const {
      cells = undefined,
      updateStatus = (message) => {
        console.warn(`Scatterplot updateStatus: ${message}`);
      },
      updateCellsSelection = (cellsSelection) => {
        console.warn(`Scatterplot updateCellsSelection: ${cellsSelection}`);
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
            const cell = cellEntry[1];
            return [cell.mappings.tsne[0], cell.mappings.tsne[1], 0];
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
          ...cellLayerDefaultProps(cells, updateStatus),
        }),
      );
    }

    return layers;
  }
}
