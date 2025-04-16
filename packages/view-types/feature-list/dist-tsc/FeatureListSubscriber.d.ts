/**
 * A subscriber component for a gene listing component.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 * @param {string} props.variablesLabelOverride The singular form
 * of the name of the variable.
 * @param {string} props.variablesPluralLabelOverride The plural
 * form of the name of the variable.
 * @param {boolean} props.enableMultiSelect If true, allow
 * shift-clicking to select multiple genes.
 * @param {boolean} props.showTable If true, shows a table with the feature name and id.
 * @param {'alphabetical'|'original'} props.sort The sort order of the genes. If sort is defined and
 * it is not equal to `alphabetical`, the genes will be displayed in the feature list in
 * the original order.
 * @param {'featureIndex'|'featureLabels'|null} props.sortKey The information to use for sorting.
 */
export function FeatureListSubscriber(props: {
    theme: string;
    coordinationScopes: object;
    removeGridComponent: Function;
    title: string;
    variablesLabelOverride: string;
    variablesPluralLabelOverride: string;
    enableMultiSelect: boolean;
    showTable: boolean;
    sort: 'alphabetical' | 'original';
    sortKey: 'featureIndex' | 'featureLabels' | null;
}): JSX.Element;
//# sourceMappingURL=FeatureListSubscriber.d.ts.map