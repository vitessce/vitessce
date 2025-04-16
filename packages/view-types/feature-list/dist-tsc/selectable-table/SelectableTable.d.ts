/**
 * A table with "selectable" rows.
 * @prop {string[]} columns An array of column names, corresponding to data object properties.
 * @prop {string[]} columnLabels An array of labels to be used for the columns, corresponding to `columns`.
 * columnLabels.length must be equal to columns.length.
 * @prop {object[]} data An array of data objects used to populate table rows.
 * @prop {function} onChange Callback function,
 * passed a selection object when `allowMultiple` is false (and `null` if `allowUncheck` is true),
 * or passed an array of selection objects when `allowMultiple` is true.
 * @prop {string} idKey The key for a unique identifier property of `data` objects.
 * @prop {string} valueKey If initially-selected rows are required,
 * this key specifies a boolean property of the `data` objects
 * indicating those rows that should be initially selected.
 * @prop {boolean} allowMultiple Whether to allow multiple rows to be selected.
 * @prop {boolean} allowUncheck Whether to allow selected rows to be un-checked. By default, false.
 * @prop {boolean} showTableHead Whether to show the table header element. By default, true.
 * @prop {boolean} showTableInputs Whether to show the table input elements for each row.
 * By default, false.
 */
export default function SelectableTable(props: any): JSX.Element;
//# sourceMappingURL=SelectableTable.d.ts.map