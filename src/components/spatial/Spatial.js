import React from 'react';

import { ScatterplotLayer, PolygonLayer, COORDINATE_SYSTEM } from 'deck.gl';
import { SelectablePolygonLayer } from '../../layers';
import { cellLayerDefaultProps, PALETTE, DEFAULT_COLOR } from '../utils';
import AbstractSelectableComponent from '../AbstractSelectableComponent';
import LayersMenu from './LayersMenu';
import OpenSeadragonComponent from '../OpenSeadragonComponent';

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
    this.state.layerIsVisible = {
      molecules: true,
      cells: true,
      neighborhoods: false,
    };
    this.setLayerIsVisible = this.setLayerIsVisible.bind(this);
    this.getInitialViewState = this.getInitialViewState.bind(this);
  }

  static defaultProps = {
    clearPleaseWait: (layer) => { console.warn(`"clearPleaseWait" not provided; layer: ${layer}`); },
  };


  componentDidUpdate() {
    if (!this.props.images) {
      return;
    }
    const imageNames = Object.keys(this.props.images);

    // Add imagery to layerIsVisible UI toggle list, if not already present.
    if (!(imageNames[0] in this.state.layerIsVisible)) {
      // This is not ideal, but it should be OK as long as the `if` prevents an infinite loop.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState((prevState) => {
        imageNames.forEach((name) => {
          // TODO: Do not mutate! https://github.com/hms-dbmi/vitessce/issues/148
          // eslint-disable-next-line no-param-reassign
          prevState.layerIsVisible[name] = true;
        });
        return prevState;
      });
    }
  }

  // These are called from superclass, so they need to belong to instance, I think.
  // eslint-disable-next-line class-methods-use-this
  getInitialViewState() {
    return this.props.view;
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
      );
    });
    return new ScatterplotLayer({
      id: 'scatter-plot',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: scatterplotData,
      pickable: true,
      autoHighlight: true,
      getRadius: 10,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => PALETTE[d[2] % PALETTE.length],
      onHover: (info) => {
        if (info.object) { updateStatus(`Gene: ${info.object[3]}`); }
      },
    });
  }

  renderNeighborhoodsLayer() {
    const {
      neighborhoods = undefined,
    } = this.props;

    return new PolygonLayer({
      id: 'neighborhoods-layer',
      getPolygon(neighborhoodsEntry) {
        const neighborhood = neighborhoodsEntry[1];
        return neighborhood.poly;
      },
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      data: Object.entries(neighborhoods),
      pickable: true,
      autoHighlight: true,
      stroked: true,
      filled: false,
      getElevation: 0,
      getLineWidth: 10,
    });
  }

  renderImages(viewProps) {
    if (!this.props.images) {
      return null;
    }
    if (this.props.clearPleaseWait) {
      this.props.clearPleaseWait('images');
    }
    const imageNames = Object.keys(this.props.images).reverse();
    // We want the z-order to be the opposite of the order listed.
    const visibleImageNames = imageNames.filter(name => this.state.layerIsVisible[name]);
    const visibleImages = visibleImageNames.map(name => this.props.images[name]);
    const tileSources = visibleImages.map(image => image.tileSource);
    // return (
    //   <OpenSeadragonComponent
    //     tileSources={tileSources}
    //     {...viewProps}
    //   />
    // );
    // TODO: Fix this
    return (
      <OpenSeadragonComponent
        tileSources={
          ['https://s3.amazonaws.com/vitessce-data/0.0.14/linnarsson-2018/linnarsson.tiles/linnarsson.images.nuclei/info.json']
        }
        {...viewProps}
      />
    );
  }

  setLayerIsVisible(layers) {
    this.setState({ layers });
  }

  renderLayersMenu() { // eslint-disable-line class-methods-use-this
    return (
      <LayersMenu
        layerIsVisible={this.state.layerIsVisible}
        setLayerIsVisible={this.setLayerIsVisible}
      />
    );
  }

  renderLayers() {
    const {
      molecules = undefined,
      cells = undefined,
      neighborhoods = undefined,
      clearPleaseWait,
    } = this.props;

    const { layerIsVisible } = this.state;

    const layerList = [];

    if (cells && clearPleaseWait) clearPleaseWait('cells');
    if (cells && layerIsVisible.cells) {
      layerList.push(this.renderCellLayer());
    }

    if (neighborhoods && clearPleaseWait) clearPleaseWait('neighborhoods');
    if (neighborhoods && layerIsVisible.neighborhoods) {
      layerList.push(this.renderNeighborhoodsLayer());
    }

    if (molecules && clearPleaseWait) clearPleaseWait('molecules');
    if (molecules && layerIsVisible.molecules) {
      // Right now the molecules scatterplot does not change,
      // so we do not need to regenerate the object.
      // And, we do not want React to look at it, so it is not part of the state.
      if (!this.moleculesLayer) this.moleculesLayer = this.renderMoleculesLayer();
      layerList.push(this.moleculesLayer);
    }

    return layerList;
  }
}
