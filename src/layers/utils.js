function fade(x) {
  return x / 3;
}

function fadeFunction(colorFunction) {
  return (cell) => {
    const rgb = colorFunction(cell);
    return [fade(rgb[0]), fade(rgb[1]), fade(rgb[2])];
  };
}

// eslint-disable-next-line import/prefer-default-export
export function overlayBaseProps(props) {
  const {
    id, getColor, data, isSelected, ...rest
  } = props;
  return {
    overlay: {
      id: `selected-${id}`,
      getFillColor: getColor,
      getLineColor: getColor,
      data: data.filter(isSelected),
      ...rest,
    },
    base: {
      id: `base-${id}`,
      getLineColor: fadeFunction(getColor),
      getFillColor: fadeFunction(getColor),
      // Alternatively: contrast outlines with solids:
      // getLineColor: getColor,
      // getFillColor: [255,255,255],
      data: data.slice(),
      ...rest,
    },
  };
}
