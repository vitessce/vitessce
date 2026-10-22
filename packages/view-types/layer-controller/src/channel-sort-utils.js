/**
 * Options for the spatialChannelsSortOrder coordination type.
 * Shared by the layer-controller and layer-controller-beta views.
 */
export const CHANNELS_SORT_ORDER_OPTIONS = [
    { value: 'original', label: 'Original' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];
  
  /**
   * Get channel dropdown options in the requested display order.
   * The returned channelIndex always refers to the position in the
   * original channel list, so selections are unaffected by sorting.
   * @param {string[]} channelNames The channel names, in original order.
   * @param {string} channelsSortOrder Either 'original' or 'alphabetical'.
   * @returns {{ channelName: string, channelIndex: number }[]}
   */
  export function getSortedChannelOptions(channelNames, channelsSortOrder) {
    if (!Array.isArray(channelNames)) return [];
    const options = channelNames
      .map((channelName, channelIndex) => ({ channelName, channelIndex }));
    if (channelsSortOrder === 'alphabetical') {
      // numeric: true ensures m/z-style numeric labels sort as 1, 2, 3, 10
      // rather than lexicographically as 1, 10, 2, 3.
      return options.sort((a, b) => String(a.channelName).localeCompare(
        String(b.channelName), undefined, { numeric: true, sensitivity: 'base' },
      ));
    }
    return options;
  }