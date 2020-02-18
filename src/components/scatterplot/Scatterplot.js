import { SelectableScatterplotLayer } from '../../layers';
import { cellLayerDefaultProps, DEFAULT_COLOR } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';

/**
React component which renders a scatterplot from cell data, typically tSNE or PCA.
*/
export default class Scatterplot extends AbstractSelectableComponent {
  static defaultProps = {
    clearPleaseWait: (layer) => { console.warn(`"clearPleaseWait" not provided; layer: ${layer}`); },
  };

  // These are called from superclass, so they need to belong to instance, I think.
  // eslint-disable-next-line class-methods-use-this
  getInitialViewState() {
    return this.props.view || {
      zoom: 2,
      target: [0, 0, 0], // Required: https://github.com/uber/deck.gl/issues/2580
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getCellCoords(cell) {
    return cell.mappings[this.props.mapping];
  }

  // eslint-disable-next-line class-methods-use-this
  getCellBaseLayerId() {
    return 'base-scatterplot';
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
      selectedCellIds = new Set(),
      uuid = null,
      clearPleaseWait,
    } = this.props;

    const { tool } = this.state;

    const layers = [];
    if (cells) {
      clearPleaseWait('cells');
      layers.push(
        new SelectableScatterplotLayer({
          id: 'scatterplot',
          isSelected: cellEntry => (
            selectedCellIds.size
              ? selectedCellIds.has(cellEntry[0])
              : true // If nothing is selected, everything is selected.
          ),
          radiusMinPixels: 1,
          radiusMaxPixels: 1,
          getPosition: (cellEntry) => {
            const mappedCell = cellEntry[1].mappings[mapping];
            return [mappedCell[0], mappedCell[1], 0];
          },
          getColor: cellEntry => (
            (this.props.cellColors && this.props.cellColors[cellEntry[0]]) || DEFAULT_COLOR
          ),
          onClick: (info) => {
            if (tool) {
              // If using a tool, prevent individual cell selection.
              // Let SelectionLayer handle the clicks instead.
              return;
            }
            const cellId = info.object[0];
            if (selectedCellIds.has(cellId)) {
              selectedCellIds.delete(cellId);
              updateCellsSelection(selectedCellIds);
            } else {
              selectedCellIds.add(cellId);
              updateCellsSelection(selectedCellIds);
            }
          },
          ...cellLayerDefaultProps(Object.entries(cells), updateStatus, updateCellsHover, uuid),
        }),
      );
    }

    return layers;
  }
}
