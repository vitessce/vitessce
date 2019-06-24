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
    const rect = el.parentNode.getBoundingClientRect();
    const { width, height } = rect;
    if (x > width / 2) {
      el.style.transform = `translateX(-${100 + offsetPercentage}%)`;
    } else {
      el.style.transform = `translateX(${offsetPercentage}%)`;
    }
    if (y > height / 2) {
      el.style.transform = `${el.style.transform} translateY(-${100 + offsetPercentage}%)`;
    } else {
      el.style.transform = `${el.style.transform} translateY(${offsetPercentage}%)`;
    }
  });

  return (
    <div
      ref={ref}
      className="cell-tooltip bg-light"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '50%',
      }}
    >
      <table>
        {Object.keys(factors).map(key => (
          <tr>
            <th>{key}</th>
            <td>{factors[key]}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
