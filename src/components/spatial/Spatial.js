import React from 'react';

import { ScatterplotLayer, COORDINATE_SYSTEM } from 'deck.gl';
import { SelectablePolygonLayer } from '../../layers';
import { cellLayerDefaultProps, PALETTE } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';
import LayersMenu from './LayersMenu';


export function square(x, y) {
  const r = 5;
  return [[x, y + r], [x + r, y], [x, y - r], [x - r, y]];
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
  constructor(props) {
    super(props);
    this.state.layers = {
      molecules: true,
      cells: true,
    };
    this.setLayersState = this.setLayersState.bind(this);
  }

  componentDidUpdate() {
    const imageNames = Object.keys(this.props.images);
    const layerNames = Object.keys(this.state.layers);
    if (layerNames.indexOf(imageNames[0]) < 0) {
      // This is not ideal, but it should be OK as long as the `if` prevents an infinite loop.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState((prevState) => {
        imageNames.forEach((name) => {
          // TODO: clone object and return copy?
          // eslint-disable-next-line no-param-reassign
          prevState.layers[name] = true;
        });
        return prevState;
      });
    }
  }

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

    return new SelectablePolygonLayer({
      id: 'polygon-layer',
      isSelected: cellEntry => (
        Object.keys(selectedCellIds).length
          ? selectedCellIds[cellEntry[0]]
          : true // If nothing is selected, everything is selected.
      ),
      getPolygon(cellEntry) {
        const cell = cellEntry[1];
        return cell.poly ? cell.poly : square(cell.xy[0], cell.xy[1]);
      },
      stroked: false,
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
      getRadius: 10,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => PALETTE[d[2] % PALETTE.length],
      onHover: (info) => {
        if (info.object) { updateStatus(`Gene: ${info.object[3]}`); }
      },
    });
  }

  renderImages(viewProps) {
    if (!this.props.images) {
      return null;
    }
    const imageNames = Object.keys(this.props.images).reverse();
    // We want the z-order to be the opposite of the order listed.
    const visibleImageNames = imageNames.filter(name => this.state.layers[name]);
    const visibleImages = visibleImageNames.map(name => this.props.images[name]);
    const svgImages = visibleImages.map(image => (
      // TODO: Actually use supplied metadata!
      <image
        key={image.href}
        x={image.x - image.width / 2}
        y={image.y}
        width={image.width * 1.65}
        height={image.height * 1.65}
        href={image.href}
      />
    ));
    const {
      x, y, width, height,
    } = viewProps;
    return (
      <svg viewBox={`${x} ${y} ${width} ${height}`}>
        {svgImages}
      </svg>
    );
  }

  setLayersState(layers) {
    this.setState({ layers });
  }

  renderLayersMenu() { // eslint-disable-line class-methods-use-this
    return (
      <LayersMenu
        layersState={this.state.layers}
        setLayersState={this.setLayersState}
      />
    );
  }

  renderLayers() {
    const {
      molecules = undefined,
      cells = undefined,
    } = this.props;

    const layerIsVisible = this.state.layers;

    const layerList = [];

    if (cells && layerIsVisible.cells) {
      layerList.push(this.renderCellLayer());
    }

    if (molecules && layerIsVisible.molecules) {
      // Right now the molecules scatterplot does not change,
      // so we do not need to regenerate the object.
      // And, we do not want React to look at it, so it is not part of the state.
      if (!this.moleculesLayer) {
        this.moleculesLayer = this.renderMoleculesLayer();
        if (this.props.clearPleaseWait) {
          this.props.clearPleaseWait();
        }
      }
      layerList.push(this.moleculesLayer);
    }

    return layerList;
  }
}
