/**
   * Method for converting an array with strings to a natural sentence,
   * concatenating the items with commans, and the last item with 'and'.
   * @param {Array} arr Array with text items.
   * @returns {string} Natural language sentence in the form of 'a, b and c', where a/b/c are items.
   */
export function arrayToString(arr: any[]): string;
/**
   * Method for converting an array with strings to a natural sentence,
   * concatenating the items with commans, and the last item with 'and'.
   * @param {Object} config Vitessce config.
   * @returns {string} Natural language sentence describing config (alt-text).
   */
export function getAltText(config: Object): string;
/**
   * Mapping of ViewType to natural language description of ViewType.
   */
export const ViewTypesToText: Map<string, string>;
//# sourceMappingURL=generate-alt-text.d.ts.map