import React from 'react';

const STROKE_WIDTH = 1.5;
const COLOR = 'currentColor';

/**
 * A small icon for an annotation shape type.
 * @param {object} props
 * @param {string} props.type The shape type.
 * @param {number} props.size The icon size, in pixels.
 */
export function ShapeIcon(props) {
  const { type, size = 13 } = props;
  let content = null;
  if (type === 'rectangle') {
    content = <rect x="1" y="3" width="11" height="7" stroke={COLOR} strokeWidth={STROKE_WIDTH} />;
  } else if (type === 'line') {
    content = (
      <>
        <line x1="1.5" y1="11.5" x2="11.5" y2="1.5" stroke={COLOR} strokeWidth={STROKE_WIDTH} strokeLinecap="round" />
        <polygon points="11.5,1.5 8.5,2.5 10.5,4.5" fill={COLOR} />
      </>
    );
  } else if (type === 'ellipse') {
    content = <ellipse cx="6.5" cy="6.5" rx="5" ry="3" stroke={COLOR} strokeWidth={STROKE_WIDTH} />;
  } else if (type === 'polygon') {
    content = <polygon points="6.5,1 11.5,4.5 9.5,11 3.5,11 1.5,4.5" stroke={COLOR} strokeWidth={STROKE_WIDTH} />;
  } else if (type === 'polyline') {
    content = <polyline points="1.5,10.5 4,5 7,8.5 10,3 12,6" stroke={COLOR} strokeWidth={STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" aria-hidden="true">
      {content}
    </svg>
  );
}
