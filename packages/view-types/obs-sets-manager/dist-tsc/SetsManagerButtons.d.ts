/**
 * A plus button for creating or importing set hierarchies.
 * @param {object} props
 * @param {string} props.datatype The data type to validate imported hierarchies against.
 * @param {function} props.onError A callback to pass error message strings.
 * @param {function} props.onImportTree A callback to pass successfully-validated tree objects.
 * @param {function} props.onCreateLevelZeroNode A callback to create a new empty
 * level zero node.
 * @param {boolean} props.importable Is importing allowed?
 * If not, the import button will not be rendered.
 * @param {boolean} props.editable Is editing allowed?
 * If not, the create button will not be rendered.
 */
export function PlusButton(props: {
    datatype: string;
    onError: Function;
    onImportTree: Function;
    onCreateLevelZeroNode: Function;
    importable: boolean;
    editable: boolean;
}): JSX.Element | null;
/**
 * Set operations buttons (union, intersection, complement)
 * and a view checked sets button.
 * @param {object} props
 * @param {function} props.onUnion A callback for the union button.
 * @param {function} props.onIntersection A callback for the intersection button.
 * @param {function} props.onComplement A callback for the complement button.
 * @param {boolean} props.operatable Are set operations allowed?
 * If not, the union, intersection, and complement buttons will not be rendered.
 */
export function SetOperationButtons(props: {
    onUnion: Function;
    onIntersection: Function;
    onComplement: Function;
    operatable: boolean;
}): JSX.Element;
//# sourceMappingURL=SetsManagerButtons.d.ts.map