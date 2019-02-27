import { ScatterplotLayer, COORDINATE_SYSTEM }
  from 'deck.gl';
import { SelectablePolygonLayer } from '../../layers';
import { cellLayerDefaultProps, PALETTE } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';


function square(x, y) {
  return [[x, y + 5], [x + 5, y], [x, y - 5], [x - 5, y]];
}

/**
 React component which expresses the spatial relationships between cells and molecules.
 {@link ../demos/spatial.html Component demo}.
 @param {Object} props React props
 @param {Object} props.cells Cell data; Should conform to
 {@link https://github.com/hms-dbmi/vitessce/blob/master/src/schemas/cells.schema.json schema}.
 @param {Object} props.molecules Molecule data; Should conform to
 {@link https://github.com/hms-dbmi/vitessce/blob/master/src/schemas/molecules.schema.json schema}.
 @param {Object} props.selectedCellIds Set of currently selected cells.
 (Only keys are used; Values should be true.)
 @param {Function} props.updateStatus Called when there is a message for the user.
 @param {Function} props.updateCellsSelection Called when the selected set is updated.
 */
export default class Spatial extends AbstractSelectableComponent {
  // These are called from superclass, so they need to belong to instance, I think.
  // eslint-disable-next-line class-methods-use-this
  getInitialViewState() {
    return {
      zoom: -3,
      offset: [0, 0], // Required: https://github.com/uber/deck.gl/issues/2580
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getCellCoords(cell) {
    return cell.xy;
  }

  renderCellLayer() {
    const {
      cells = undefined,
      selectedCellIds = {},
      updateStatus = (message) => {
        console.warn(`Spatial updateStatus: ${message}`);
      },
      updateCellsSelection = (cellsSelection) => {
        console.warn(`Spatial updateCellsSelection: ${cellsSelection}`);
      },
    } = this.props;

    const clusterColors = {};
    Object.values(cells).forEach((cell) => {
      if (!clusterColors[cell.cluster]) {
        clusterColors[cell.cluster] = PALETTE[Object.keys(clusterColors).length % PALETTE.length];
      }
    });

    return new SelectablePolygonLayer({
      id: 'polygon-layer',
      isSelected: cellEntry => (
        Object.keys(selectedCellIds).length
          ? selectedCellIds[cellEntry[0]]
          : true // If nothing is selected, everything is selected.
      ),
      wireframe: true,
      lineWidthMinPixels: 1,
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
    });
  }

  renderMoleculesLayer() {
    const {
      molecules = undefined,
      updateStatus = (message) => {
        console.warn(`Spatial updateStatus: ${message}`);
      },
    } = this.props;

    let scatterplotData = [];
    Object.entries(molecules).forEach(([molecule, coords], index) => {
      scatterplotData = scatterplotData.concat(
        coords.map(([x, y]) => [x, y, index, molecule]), // eslint-disable-line no-loop-func
        // TODO: Using an object would be more clear, but is there a performance penalty,
        // either in time or memory?
      );
    });
    return new ScatterplotLayer({
      id: 'scatter-plot',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: scatterplotData,
      pickable: true,
      autoHighlight: true,
      // TODO: How do the other radius attributes work?
      // If it were possible to have dots that remained the same size,
      // regardless of zoom, would we prefer that?
      getRadius: 1,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => PALETTE[d[2] % PALETTE.length],
      onHover: (info) => {
        if (info.object) { updateStatus(`Gene: ${info.object[3]}`); }
      },
    });
  }

  renderLayers() {
    const {
      molecules = undefined,
      cells = undefined,
    } = this.props;

    const layers = [];

    // TODO: imagery

    if (cells) {
      layers.push(this.renderCellLayer());
    }

    if (molecules) {
      // Right now the molecules scatterplot does not change,
      // so we do not need to regenerate the object.
      // And, we do not want React to look at it, so it is not part of the state.
      if (!this.moleculesLayer) {
        this.moleculesLayer = this.renderMoleculesLayer();
      }
      layers.push(this.moleculesLayer);
    }

    return layers;
  }
}
