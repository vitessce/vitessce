function sum(a) {
  return a.reduce((x, y) => x + y, 0);
}

export function makeGridLayout(colXs, colLayout) {
  const colWs = [];
  for (let i = 0; i < colXs.length; i++) { // eslint-disable-line no-plusplus
    colWs.push(colXs[i + 1] - colXs[i]);
  }
  return Object.entries(colLayout).map(([id, spec]) => ({
    i: id,
    y: spec.y,
    h: spec.h || 1,
    x: colXs[spec.x],
    w: sum(colWs.slice(spec.x, spec.x + (spec.w || 1))),
  }));
}
