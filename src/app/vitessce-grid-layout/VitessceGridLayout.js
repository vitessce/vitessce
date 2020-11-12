import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import isEqual from 'lodash/isEqual';
import { getMaxRows, resolveLayout, COMPONENT_ID_PREFIX } from './layout-utils';

const ResponsiveGridLayout = WidthProvider(Responsive);

class ResponsiveHeightGridLayout extends ResponsiveGridLayout {
  componentDidUpdate(prevProps) {
    if (this.props.height !== prevProps.height) {
      this.onWindowResize();
    }
  }
}

export default function VitessceGridLayout(props) {
  const {
    layout,
    getComponent, padding, margin, draggableHandle,
    reactGridLayoutProps, rowHeight, theme, height,
    onRemoveComponent, onComponentChange,
  } = props;

  const [gridComponents, setGridComponents] = useState({});
  const [gridCols, setGridCols] = useState(null);
  const [gridLayouts, setGridLayouts] = useState(null);
  const [gridBreakpoints, setGridBreakpoints] = useState(null);
  const [maxRows, setMaxRows] = useState(0);

  // If layout changes, update grid components and clear ready components.
  useEffect(() => {
    const {
      cols, layouts, breakpoints, components,
    } = resolveLayout(layout);
    // Hold all of these in state in the case of new layouts coming in.
    setGridComponents(components);
    setGridCols(cols);
    setGridLayouts(layouts);
    setGridBreakpoints(breakpoints);
    setMaxRows(getMaxRows(layouts));
  }, [layout]);

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

  const onLayoutChange = (newLayout) => {
    if (newLayout.length === Object.entries(gridComponents).length) {
      newLayout.forEach((nextC) => {
        const id = nextC.i;
        const prevC = gridComponents[id];
        const i = parseInt(id.substring(id.indexOf(COMPONENT_ID_PREFIX) + 1), 10);
        const nextProps = {
          x: nextC.x, y: nextC.y, w: nextC.w, h: nextC.h,
        };
        const prevProps = {
          x: prevC.x, y: prevC.y, w: prevC.w, h: prevC.h,
        };
        if (!isEqual(nextProps, prevProps)) {
          onComponentChange(i, nextProps);
        }
      });
    }
  };

  const layoutChildren = Object.entries(gridComponents).map(([k, v], i) => {
    const Component = getComponent(v.component);

    const removeGridComponent = () => {
      const nextGridComponents = { ...gridComponents };
      delete nextGridComponents[k];
      setGridComponents(nextGridComponents);
      onRemoveComponent(i);
    };

    return (
      <div key={k}>
        <Component
          {... v.props}
          uuid={i}
          coordinationScopes={v.coordinationScopes}
          theme={theme}
          removeGridComponent={removeGridComponent}
        />
      </div>
    );
  });
  return (gridComponents && gridCols && gridLayouts && gridBreakpoints) && (
    <>
      {style}
      <ResponsiveHeightGridLayout
        className="layout"
        cols={gridCols}
        layouts={gridLayouts}
        breakpoints={gridBreakpoints}
        height={height}
        rowHeight={
          rowHeight
          || (
            (window.innerHeight - 2 * padding - (maxRows - 1) * margin)
            / maxRows
          )}
        containerPadding={[padding, padding]}
        margin={[margin, margin]}
        draggableHandle={draggableHandle}
        onLayoutChange={onLayoutChange}
        {... reactGridLayoutProps}
      >
        {layoutChildren}
      </ResponsiveHeightGridLayout>
    </>
  );
}

VitessceGridLayout.defaultProps = {
  padding: 10,
  margin: 10,
};
