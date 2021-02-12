import React, { useEffect, useRef } from 'react';

export default function Tooltip(props) {
  const {
    x,
    y,
    parentWidth,
    parentHeight,
    children,
  } = props;

  const ref = useRef(null);
  const isNarrow = (parentWidth < 500);
  // Do collision detection based on the bounds of the tooltip ancestor element.
  useEffect(() => {
    const el = ref.current;
    const offsetPercentage = isNarrow ? -5 : 10;
    const translateX = (x > parentWidth / 2) ? -(100 + offsetPercentage) : offsetPercentage;
    const translateY = (y > parentHeight / 2) ? -(100 + offsetPercentage) : offsetPercentage;
    const scale = isNarrow ? 0.75 : 1.0;
    el.style.transform = `translateX(${translateX}%) translateY(${translateY}%) scale(${scale})`;
    el.style.whiteSpace = (isNarrow ? 'normal' : 'nowrap');
  });

  return (
    <div
      ref={ref}
      className="cell-tooltip bg-primary"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {children}
    </div>
  );
}
