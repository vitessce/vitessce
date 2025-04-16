/**
 * Construct DeckGL selection layers.
 * @param {string} tool
 * @param {number} zoom
 * @param {string} cellBaseLayerId
 * @param {object[]} obsLayers Objects with properties
 * getObsCoords, obsIndex, obsQuadTree, onSelect.
 * @returns {object[]} The array of DeckGL selection layers.
 */
export function getSelectionLayer(tool: string, zoom: number, layerId: any, obsLayers: object[], flipY?: boolean): object[];
/**
 * Get deck.gl layer props for selection overlays.
 * @param {object} props
 * @returns {object} Object with two properties,
 * overlay: overlayProps, base: baseProps,
 * where the values are deck.gl layer props.
 */
export function overlayBaseProps(props: object): object;
//# sourceMappingURL=selection-utils.d.ts.map