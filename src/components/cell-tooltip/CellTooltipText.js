import React, { useEffect, useRef } from 'react';

export default function CellTooltipText(props) {
  const {
    x,
    y,
    factors,
  } = props;

  const ref = useRef(null);
  const offsetPercentage = 10;

  // Do collision detection based on the bounds of the parent (.card-body) element.
  useEffect(() => {
    const el = ref.current;
    const rect = el.parentNode.closest('.card-body').getBoundingClientRect();
    const { width, height } = rect;
    const translateX = (x > width / 2) ? -(100 + offsetPercentage) : offsetPercentage;
    const translateY = (y > height / 2) ? -(100 + offsetPercentage) : offsetPercentage;
    el.style.transform = `translateX(${translateX}%) translateY(${translateY}%)`;
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
