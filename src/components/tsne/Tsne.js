import PropTypes from 'prop-types';
import { SelectableScatterplotLayer } from '../../layers';
import { cellLayerDefaultProps, PALETTE } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';


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
      const clusterColors = {};
      Object.values(cells).forEach((cell) => {
        if (!clusterColors[cell.cluster]) {
          clusterColors[cell.cluster] = PALETTE[Object.keys(clusterColors).length % PALETTE.length];
        }
      });
      layers.push(
        new SelectableScatterplotLayer({
          id: 'tsne-scatter-plot',
          isSelected: cellEntry => selectedCellIds[cellEntry[0]],
          getRadius: 0.5,
          lineWidthMinPixels: 0.1,
          stroked: true,
          getPosition: (cellEntry) => {
            const cell = cellEntry[1];
            return [cell.tsne[0], cell.tsne[1], 0];
          },
          getColor: cellEntry => clusterColors[cellEntry[1].cluster],
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

Tsne.propTypes = {
  viewState: PropTypes.object,
  controller: PropTypes.bool,
  isRectangleSelection: PropTypes.bool,
  cells: PropTypes.object,
  selectedCellIds: PropTypes.object,
  updateStatus: PropTypes.func,
  updateCellsSelection: PropTypes.func,
};
