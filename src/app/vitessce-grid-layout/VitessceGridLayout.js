import React from 'react';
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
    onRemoveComponent, onLayoutChange: onLayoutChangeProp,
  } = props;

  // If layout changes, update grid components.
  const {
    cols: gridCols, layouts: gridLayouts, breakpoints: gridBreakpoints, components: gridComponents,
  } = resolveLayout(layout);

  const maxRows = getMaxRows(gridLayouts);

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
      const newComponentProps = [];
      newLayout.forEach((nextC) => {
        const id = nextC.i;
        const prevC = gridComponents[id];
        if (prevC) {
          const i = parseInt(id.substring(id.indexOf(COMPONENT_ID_PREFIX) + 1), 10);
          const nextProps = {
            x: nextC.x, y: nextC.y, w: nextC.w, h: nextC.h,
          };
          const prevProps = {
            x: prevC.x, y: prevC.y, w: prevC.w, h: prevC.h,
          };
          if (!isEqual(nextProps, prevProps)) {
            newComponentProps.push([i, nextProps]);
          }
        }
      });
      if (newComponentProps.length > 0) {
        onLayoutChangeProp(newComponentProps);
      }
    }
  };

  const layoutChildren = Object.entries(gridComponents).map(([k, v], i) => {
    const Component = getComponent(v.component);

    const removeGridComponent = () => {
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
  return (gridLayouts && gridComponents && gridBreakpoints && gridCols) && (
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
