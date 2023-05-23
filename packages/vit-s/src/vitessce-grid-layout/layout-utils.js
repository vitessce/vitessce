import { range } from 'lodash-es';

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

export function getMaxRows(layouts) {
  return Math.max(
    ...Object.values(layouts).map(
      layout => Math.max(
        ...layout.map(xywh => xywh.y + xywh.h),
      ),
    ),
  );
}

export function resolveLayout(layout) {
  const cols = {};
  const layouts = {};
  const breakpoints = {};
  const components = {};
  const positions = {};

  (('components' in layout) ? layout.components : layout).forEach(
    (def) => {
      const id = def.uid;
      components[id] = {
        uid: def.uid,
        component: def.component,
        props: def.props || {},
        coordinationScopes: def.coordinationScopes || {},
        coordinationScopesBy: def.coordinationScopesBy || {},
      };
      positions[id] = {
        id, x: def.x, y: def.y, w: def.w, h: def.h,
      };
    },
  );

  if ('components' in layout) {
    Object.entries(layout.columns).forEach(
      ([width, columnXs]) => {
        cols[width] = columnXs[columnXs.length - 1];
        layouts[width] = makeGridLayout(columnXs, positions);
        breakpoints[width] = width;
      },
    );
  } else {
    // static layout
    const id = 'ID';
    const columnCount = 12;
    cols[id] = columnCount;
    layouts[id] = makeGridLayout(range(columnCount + 1), positions);
    breakpoints[id] = 1000;
    // Default has different numbers of columns at different widths,
    // so we do need to override that to ensure the same number of columns,
    // regardless of window width.
  }
  return {
    cols, layouts, breakpoints, components,
  };
}
