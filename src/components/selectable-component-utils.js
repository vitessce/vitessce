import { COORDINATE_SYSTEM } from 'deck.gl';
import SelectionLayer from '../layers/SelectionLayer';

export function getSelectionLayers(
  tool,
  zoom,
  cellBaseLayerId,
  getCellCoords,
  updateCellsSelection,
) {
  if (!tool) {
    return [];
  }

  const editHandlePointRadius = 5 / (zoom + 16);

  return [new SelectionLayer({
    id: 'selection',
    getCellCoords,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    selectionType: tool,
    onSelect: ({ pickingInfos }) => {
      const cellIds = new Set(pickingInfos.map(cellObj => cellObj.object[0]));
      updateCellsSelection(cellIds);
    },
    layerIds: [cellBaseLayerId],
    getTentativeFillColor: () => [255, 255, 255, 95],
    getTentativeLineColor: () => [143, 143, 143, 255],
    getTentativeLineDashArray: () => [7, 4],
    lineWidthMinPixels: 2,
    lineWidthMaxPixels: 2,
    getEditHandlePointColor: () => [0xff, 0xff, 0xff, 0xff],
    getEditHandlePointRadius: () => editHandlePointRadius,
    editHandlePointRadiusScale: 1,
    editHandlePointRadiusMinPixels: editHandlePointRadius,
    editHandlePointRadiusMaxPixels: 2 * editHandlePointRadius,
  })];
}
