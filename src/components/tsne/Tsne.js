import { SelectableScatterplotLayer } from '../../layers';
import { cellLayerDefaultProps } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';

/**
React component which renders a scatterplot from cell data, typically tSNE.
{@link ../demos/tsne.html Component demo}.
@param {Object} props React props
@param {Object} props.cells Cell data; Should conform to
{@link https://github.com/hms-dbmi/vitessce/blob/master/src/schemas/cells.schema.json schema}.
@param {Object} props.selectedCellIds Set of currently selected cells.
(Only keys are used; Values should be true.)
@param {Function} props.updateStatus Called when there is a message for the user.
@param {Function} props.updateCellsSelection Called when the selected set is updated.
*/
export default class Tsne extends AbstractSelectableComponent {
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
    return cell.tsne;
  }

  renderLayers() {
    const {
      cells = undefined,
      updateStatus = (message) => {
        console.warn(`Tsne updateStatus: ${message}`);
      },
      updateCellsSelection = (cellsSelection) => {
        console.warn(`Tsne updateCellsSelection: ${cellsSelection}`);
      },
      selectedCellIds = {},
    } = this.props;

    const layers = [];

    if (cells) {
      layers.push(
        new SelectableScatterplotLayer({
          id: 'tsne-scatter-plot',
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
            return [cell.tsne[0], cell.tsne[1], 0];
          },
          getColor: cellEntry => (
            this.props.cellColors ? this.props.cellColors[cellEntry[0]] : [0, 0, 0]
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
