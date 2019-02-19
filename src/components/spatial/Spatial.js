import { ScatterplotLayer, COORDINATE_SYSTEM }
  from 'deck.gl';
import PropTypes from 'prop-types';
import { SelectablePolygonLayer } from '../../layers';
import { cellLayerDefaultProps, PALETTE } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';


function square(x, y) {
  return [[x, y + 100], [x + 100, y], [x, y - 100], [x - 100, y]];
}

export default class Spatial extends AbstractSelectableComponent {
  getInitialViewState() {
    return {
      zoom: -5,
      offset: [460, 640], // Required: https://github.com/uber/deck.gl/issues/2580
    };
  }

  getCellCoords(cell) {
    return cell.poly[0];
  }

  renderLayers() {
    const {
      // baseImg = undefined,
      molecules = undefined,
      cells = undefined,
      selectedCellIds = {},
      updateStatus = (message) => {
        console.warn(`Spatial updateStatus: ${message}`);
      },
      updateCellsSelection = (cellsSelection) => {
        console.warn(`Spatial updateCellsSelection: ${cellsSelection}`);
      },
    } = this.props;

    const layers = [];

    if (cells) {
      const clusterColors = {};
      for (const cell of Object.values(cells)) {
        if (!clusterColors[cell.cluster]) {
          clusterColors[cell.cluster] = PALETTE[Object.keys(clusterColors).length % PALETTE.length];
        }
      }
      layers.push(
        new SelectablePolygonLayer({
          id: 'polygon-layer',
          isSelected: cellEntry => selectedCellIds[cellEntry[0]],
          wireframe: true,
          lineWidthMinPixels: 15,
          getPolygon(cellEntry) {
            const cell = cellEntry[1];
            return cell.poly ? cell.poly : square(cell.xy[0], cell.xy[1]);
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

    if (molecules) {
      // Right now the molecules scatterplot does not change,
      // so we do not need to regenerate the object.
      // We do not want React to look at it, so it is not part of the state.
      if (!this.scatterplotLayer) {
        let scatterplotData = [];
        let index = 0;
        for (const [molecule, coords] of Object.entries(molecules)) {
          scatterplotData = scatterplotData.concat(
            coords.map(([x, y]) => [x, y, index, molecule]), // eslint-disable-line no-loop-func
            // TODO: Using an object would be more clear, but is there a performance penalty,
            // either in time or memory?
          );
          index++;
        }
        this.scatterplotLayer = new ScatterplotLayer({
          id: 'scatter-plot',
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          data: scatterplotData,
          pickable: true,
          autoHighlight: true,
          // TODO: How do the other radius attributes work?
          // If it were possible to have dots that remained the same size,
          // regardless of zoom, would we prefer that?
          getRadius: 10,
          getPosition: d => [d[0], d[1], 0],
          getColor: d => PALETTE[d[2] % PALETTE.length],
          onHover: (info) => {
            if (info.object) { updateStatus(`Gene: ${info.object[3]}`); }
          },
        });
      }
      layers.push(this.scatterplotLayer);
    }

    return layers;
  }
}


Spatial.propTypes = {
  viewState: PropTypes.object,
  controller: PropTypes.bool,
  molecules: PropTypes.object,
  cells: PropTypes.object,
  selectedCellIds: PropTypes.object,
  updateStatus: PropTypes.func,
  updateCellsSelection: PropTypes.func,
  isRectangleSelection: PropTypes.bool,
};
