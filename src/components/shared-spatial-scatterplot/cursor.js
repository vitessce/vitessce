export const getCursorWithTool = () => 'crosshair';
export const getCursor = interactionState => (interactionState.isDragging
  ? 'grabbing' : 'default'
);
