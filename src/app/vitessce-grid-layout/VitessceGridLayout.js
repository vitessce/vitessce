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
    isBounded,
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

  // A bit of hacky feeling stuff to prevent users from stacking elements and forcing the
  // grid boundary to change even when isBounded is set to true. It seems like react-grid-layout
  // should support this through isBounded and maxRows, but neither of these actually works for the
  // edge case where a user drags one element above another and forces the first element downwards.
  //
  // Additionally, react-grid-layout doesn't revert if you don't save a new/changed layouts. If you
  // wish to do this, first you have to save the new layouts and render the grid with it, and then
  // you can revert to the original layouts. Thus, we need one state for the current grid layouts,
  // which gets called on every onLayoutChange. If the grid height is still valid, we then call
  // onValidLayoutChange, otherwise we reset currentGridLayouts to lastValidGridLayouts.
  //
  // See the following GitHub issue for more information.
  // https://github.com/react-grid-layout/react-grid-layout/issues/1104#issuecomment-827785217
  const [currentGridLayouts, setCurrentGridLayouts] = React.useState(gridLayouts);
  const [lastValidGridLayouts, setLastValidGridLayouts] = React.useState(gridLayouts);

  const onValidLayoutChange = (newLayout) => {
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

  const onLayoutChange = (newLayout, allLayouts) => {
    setCurrentGridLayouts(allLayouts);
    if (!isBounded || getMaxRows({ ID: newLayout }) <= maxRows) {
      onValidLayoutChange(newLayout);
      setLastValidGridLayouts(allLayouts);
    } else {
      setCurrentGridLayouts(lastValidGridLayouts);
    }
  };

  const saveCurrentLayouts = () => {
    setLastValidGridLayouts(currentGridLayouts);
  };


  const layoutChildren = Object.values(gridComponents).map((v) => {
    const Component = getComponent(v.component);

    const removeGridComponent = () => {
      onRemoveComponent(v.uid);
    };

    return (
      <div key={v.uid}>
        <Component
          {... v.props}
          uuid={v.uid}
          coordinationScopes={v.coordinationScopes}
          theme={theme}
          removeGridComponent={removeGridComponent}
        />
      </div>
    );
  });
  return (currentGridLayouts && gridComponents && gridBreakpoints && gridCols) && (
    <>
      {style}
      <ResponsiveHeightGridLayout
        className="layout"
        cols={gridCols}
        layouts={currentGridLayouts}
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
        isBounded={isBounded}
        onResizeStart={saveCurrentLayouts}
        onDragStart={saveCurrentLayouts}
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
