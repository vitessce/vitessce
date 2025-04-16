declare class SelectionLayer {
    _selectPolygonObjects(coordinates: any): void;
    _selectEmpty(): void;
    renderLayers(): EditableGeoJsonLayer[];
}
declare namespace SelectionLayer {
    export let layerName: string;
    export { defaultProps };
}
export default SelectionLayer;
import { EditableGeoJsonLayer } from '@nebula.gl/layers';
declare namespace defaultProps {
    let layerIds: never[];
    function onSelect(): void;
}
//# sourceMappingURL=SelectionLayer.d.ts.map