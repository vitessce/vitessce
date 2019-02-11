import React from 'react';

export function ToolPicker(props) {
  return (
    <div>
      <button type='button' className='btn btn-outline-secondary mr-2 icon'>
        <img src="inkscape/tool_pointer.svg" alt="pointer tool"/>
      </button>
      <button type='button' className='btn btn-outline-secondary mr-2 icon'>
        <img src="inkscape/snap_bounding_box_center.svg" alt="region selection tool"/>
      </button>
    </div>);
}
