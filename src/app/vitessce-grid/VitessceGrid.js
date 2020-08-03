import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { getMaxRows, resolveLayout } from './layoutUtils';

const ResponsiveGridLayout = WidthProvider(Responsive);

class ResponsiveHeightGridLayout extends ResponsiveGridLayout {
  componentDidUpdate(prevProps) {
    if (this.props.height !== prevProps.height) {
      this.onWindowResize();
    }
  }
}

export default function VitessceGrid(props) {
  const {
    layout, getComponent, padding, margin, draggableHandle,
    reactGridLayoutProps, onAllReady, rowHeight, theme, height,
  } = props;

  // eslint-disable-next-line no-unused-vars
  const [_readyComponentKeys, setReadyComponentKeys] = useState(new Set());
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
  return (gridComponents && gridCols && gridLayouts && gridBreakpoints) && (
    <React.Fragment>
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
        {... reactGridLayoutProps}
      >
        {layoutChildren}
      </ResponsiveHeightGridLayout>
    </React.Fragment>
  );
}

VitessceGrid.defaultProps = {
  padding: 10,
  margin: 10,
  onAllReady: () => {},
};
