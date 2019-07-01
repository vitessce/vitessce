import React, { useEffect, useRef } from 'react';

export default function CellTooltipText(props) {
  const {
    x,
    y,
    parentWidth,
    parentHeight,
    factors,
  } = props;

  const ref = useRef(null);
  const reduceSize = (parentWidth < 300);
  // Do collision detection based on the bounds of the tooltip ancestor element.
  useEffect(() => {
    const el = ref.current;
    const offsetPercentage = reduceSize ? -5 : 10;
    const translateX = (x > parentWidth / 2) ? -(100 + offsetPercentage) : offsetPercentage;
    const translateY = (y > parentHeight / 2) ? -(100 + offsetPercentage) : offsetPercentage;
    const scale = reduceSize ? 0.75 : 1.0;
    el.style.transform = `translateX(${translateX}%) translateY(${translateY}%) scale(${scale})`;
    el.style.whiteSpace = (reduceSize ? 'normal' : 'nowrap');
  });

  return (
    <div
      ref={ref}
      className="cell-tooltip bg-light"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <table>
        <tbody>
          {Object.keys(factors).map(key => (
            <tr key={key}>
              <th>{key}</th>
              <td>{factors[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
