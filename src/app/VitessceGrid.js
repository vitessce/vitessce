import React, { useState } from 'react';
import range from 'lodash/range';
import sum from 'lodash/sum';
import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
      const id = `r${def.x}_c${def.y}`;
      components[id] = {
        component: def.component, props: def.props || {},
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

export default function VitessceGrid(props) {
  const {
    layout, getComponent, padding, margin, draggableHandle,
    reactGridLayoutProps, onAllReady, rowHeight, theme,
  } = props;
  const {
    cols, layouts, breakpoints, components,
  } = resolveLayout(layout);

  // eslint-disable-next-line no-unused-vars
  const [_readyComponentKeys, setReadyComponentKeys] = useState(new Set());
  const [gridComponents, setGridComponents] = useState(components);

  // Inline CSS is generally avoided, but this saves the end-user a little work,
  // and prevents class names from getting out of sync.
  const style = (
    <style>
      {`
          ${draggableHandle} {
            cursor: grab;
          }
          ${draggableHandle}:active {
            cursor: grabbing;
          }
     `}
    </style>
  );

  const layoutChildren = Object.entries(gridComponents).map(([k, v]) => {
    const Component = getComponent(v.component);
    const onReady = () => {
      setReadyComponentKeys((prevReadyComponentKeys) => {
        prevReadyComponentKeys.add(k);
        if (prevReadyComponentKeys.size === Object.keys(gridComponents).length) {
          // The sets are now equal.
          onAllReady();
        }
        return prevReadyComponentKeys;
      });
    };

    const removeGridComponent = () => {
      const newGridComponents = { ...gridComponents };
      delete newGridComponents[k];
      setGridComponents(newGridComponents);
    };

    return (
      <div key={k}>
        <Component
          {... v.props}
          theme={theme}
          removeGridComponent={removeGridComponent}
          onReady={onReady}
        />
      </div>
    );
  });
  const maxRows = getMaxRows(layouts);
  return (
    <React.Fragment>
      {style}
      <ResponsiveGridLayout
        className="layout"
        cols={cols}
        layouts={layouts}
        breakpoints={breakpoints}
        rowHeight={
          rowHeight
          || (
            (window.innerHeight - 2 * padding - (maxRows - 1) * margin)
            / maxRows
          )}
        containerPadding={[padding, padding]}
        margin={[margin, margin]}
        draggableHandle={draggableHandle}
        {... reactGridLayoutProps}
      >
        {layoutChildren}
      </ResponsiveGridLayout>
    </React.Fragment>
  );
}

VitessceGrid.defaultProps = {
  padding: 10,
  margin: 10,
  onAllReady: () => {},
};
