import React, { useState, useMemo, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout-with-lodash';
import { isEqual } from 'lodash-es';
import { getMaxRows, resolveLayout } from './layout-utils.js';

const ResponsiveGridLayout = WidthProvider(Responsive);

class ResponsiveHeightGridLayout extends ResponsiveGridLayout {
  componentDidUpdate(prevProps) {
    if (this.props.height !== prevProps.height) {
      this.onWindowResize();
    }
  }
}

export function VitessceGridLayout(props) {
  const {
    layout,
    viewTypes, padding, margin: marginProp, draggableHandle: draggableHandleClass,
    onResize, onResizeStop, rowHeight, theme, height,
    onRemoveComponent, onLayoutChange: onLayoutChangeProp,
    isBounded,
  } = props;

  const getComponent = useCallback((viewType) => {
    if (Array.isArray(viewTypes)) {
      const matchingViewType = viewTypes.find(v => v.name === viewType);
      if (matchingViewType) {
        return matchingViewType.component;
      }
    }
    return () => null;
  }, [viewTypes]);

  const draggableHandle = `.${draggableHandleClass}`;

  // If layout changes, update grid components.
  const {
    cols: gridCols, layouts: gridLayouts, breakpoints: gridBreakpoints, components: gridComponents,
  } = useMemo(() => resolveLayout(layout), [layout]);

  const containerPadding = useMemo(() => ([padding, padding]), [padding]);
  const margin = useMemo(() => ([marginProp, marginProp]), [marginProp]);

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
  // you can revert to the original layouts. Thus, we need one state for a temporary grid layout,
  // which gets called on every onLayoutChange. If the grid height is still valid, we then call
  // onValidLayoutChange, otherwise we call onValidLayoutChange with lastValidGridLayouts.
  //
  // See the following GitHub issue for more information.
  // https://github.com/react-grid-layout/react-grid-layout/issues/1104#issuecomment-827785217
  const [tempGridLayouts, setTempGridLayouts] = useState(null);
  const [lastValidGridLayouts, setLastValidGridLayouts] = useState(gridLayouts);

  const onValidLayoutChange = useCallback((newLayout) => {
    if (newLayout.length === Object.entries(gridComponents).length) {
      const newComponentProps = {};
      newLayout.forEach((nextC) => {
        const id = nextC.i;
        const prevC = gridComponents[id];
        if (prevC) {
          const nextProps = {
            x: nextC.x, y: nextC.y, w: nextC.w, h: nextC.h,
          };
          const prevProps = {
            x: prevC.x, y: prevC.y, w: prevC.w, h: prevC.h,
          };
          if (!isEqual(nextProps, prevProps)) {
            newComponentProps[id] = nextProps;
          }
        }
      });
      if (Object.keys(newComponentProps).length > 0) {
        onLayoutChangeProp(newComponentProps);
      }
    }
  }, [gridComponents, onLayoutChangeProp]);

  const onLayoutChange = useCallback((newLayout, allLayouts) => {
    // We first need to set the new layout to the potentially-invalid allLayouts
    // (see comments above about react-grid-layout limitations).
    setTempGridLayouts(allLayouts);
    // Then we wait 50ms and validate/set the new layout.
    setTimeout(() => {
      if (!isBounded || getMaxRows({ ID: newLayout }) <= maxRows) {
        // Good, new layout was valid with respect to isBounded, so set in parent.
        onValidLayoutChange(newLayout);
        setLastValidGridLayouts(allLayouts);
      } else {
        // Bad, new layout was not valid with respect to isBounded.
        onValidLayoutChange(lastValidGridLayouts);
      }
      setTempGridLayouts(null);
    }, 50);
  }, [isBounded, lastValidGridLayouts, maxRows, onValidLayoutChange]);

  const saveCurrentLayouts = useCallback(() => {
    setLastValidGridLayouts(gridLayouts);
  }, [gridLayouts]);

  const layoutChildren = useMemo(() => Object.values(gridComponents).map((v) => {
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
          coordinationScopesBy={v.coordinationScopesBy}
          theme={theme}
          removeGridComponent={removeGridComponent}
        />
      </div>
    );
  }), [gridComponents, getComponent, onRemoveComponent, theme]);

  return (gridLayouts && gridComponents && gridBreakpoints && gridCols) && (
    <>
      {style}
      <ResponsiveHeightGridLayout
        className="layout"
        cols={gridCols}
        layouts={tempGridLayouts || gridLayouts}
        breakpoints={gridBreakpoints}
        height={height}
        rowHeight={
          rowHeight
          || (
            (window.innerHeight - 2 * padding - (maxRows - 1) * margin)
            / maxRows
          )}
        containerPadding={containerPadding}
        margin={margin}
        draggableHandle={draggableHandle}
        onLayoutChange={onLayoutChange}
        isBounded={isBounded}
        onResizeStart={saveCurrentLayouts}
        onDragStart={saveCurrentLayouts}
        onResize={onResize}
        onResizeStop={onResizeStop}
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
