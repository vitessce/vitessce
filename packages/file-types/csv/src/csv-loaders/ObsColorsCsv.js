import CsvLoader from './CsvLoader.js';

const HEX_REGEX = /^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/i;

function parseHexColor(hex) {
  const result = HEX_REGEX.exec(String(hex).trim());
  if (!result) {
    return null;
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function parseChannel(value) {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return null;
  }
  return Math.max(0, Math.min(255, Math.round(num)));
}

export default class ObsColorsCsvLoader extends CsvLoader {
  loadFromCache(data) {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const { obsIndex: indexCol, obsColors: colorCols } = this.options;
    const obsIndex = data.map(d => String(d[indexCol]));
    // The obsColors option is either a single column of hex color strings,
    // or an array of three columns for the R, G, and B channel values.
    const obsColors = Array.isArray(colorCols)
      ? data.map((d) => {
        const rgb = colorCols.map(col => parseChannel(d[col]));
        return rgb.some(c => c === null) ? null : rgb;
      })
      : data.map(d => parseHexColor(d[colorCols]));

    // For convenience, also provide a Map from observation ID to [r, g, b],
    // so that consumers do not need to align obsIndex and obsColors themselves.
    // Observations whose color could not be parsed are omitted.
    const obsColorMap = new Map(
      obsIndex
        .map((obsId, i) => ([obsId, obsColors[i]]))
        .filter(([, color]) => color !== null),
    );
    this.cachedResult = { obsIndex, obsColors, obsColorMap };
    return this.cachedResult;
  }
}
