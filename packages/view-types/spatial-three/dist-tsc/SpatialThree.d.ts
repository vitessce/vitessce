/**
 * React component which expresses the spatial relationships between cells and molecules using ThreeJS
 * @param {object} props
 * @param {string} props.uuid A unique identifier for this component,
 * used to determine when to show tooltips vs. crosshairs.
 * @param {number} props.height Height of the canvas, used when
 * rendering the scale bar layer.
 * @param {number} props.width Width of the canvas, used when
 * rendering the scale bar layer.
 * @param {object} props.molecules Molecules data.
 * @param {object} props.cells Cells data.
 * @param {object} props.neighborhoods Neighborhoods data.
 * @param {number} props.lineWidthScale Width of cell border in view space (deck.gl).
 * @param {number} props.lineWidthMaxPixels Max width of the cell border in pixels (deck.gl).
 * @param {object} props.cellColors Map from cell IDs to colors [r, g, b].
 * @param {function} props.getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @param {function} props.getCellColor Getter function for cell color as [r, g, b] array.
 * @param {function} props.getCellPolygon Getter function for cell polygons.
 * @param {function} props.getCellIsSelected Getter function for cell layer isSelected.
 * @param {function} props.getMoleculeColor
 * @param {function} props.getMoleculePosition
 * @param {function} props.getNeighborhoodPolygon
 * @param {function} props.updateViewInfo Handler for viewport updates, used when rendering tooltips and crosshairs.
 * @param {function} props.onCellClick Getter function for cell layer onClick.
 * @param {string} props.theme "light" or "dark" for the vitessce theme
 */
export function SpatialThree(props: {
    uuid: string;
    height: number;
    width: number;
    molecules: object;
    cells: object;
    neighborhoods: object;
    lineWidthScale: number;
    lineWidthMaxPixels: number;
    cellColors: object;
    getCellCoords: Function;
    getCellColor: Function;
    getCellPolygon: Function;
    getCellIsSelected: Function;
    getMoleculeColor: Function;
    getMoleculePosition: Function;
    getNeighborhoodPolygon: Function;
    updateViewInfo: Function;
    onCellClick: Function;
    theme: string;
}): JSX.Element | null;
//# sourceMappingURL=SpatialThree.d.ts.map