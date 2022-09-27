export const getCursorWithTool = () => 'crosshair';
export const getCursor = interactionState => (interactionState.isDragging
  ? 'grabbing' : 'default'
);

export function getOnHoverCallback(obsIndex, setObsHighlight, setComponentHover) {
  return (info) => {
    // Notify the parent component that its child component is
    // the "hover source".
    if (setComponentHover) {
      setComponentHover();
    }
    if (info.index) {
      const obsId = obsIndex[info.index];
      if (setObsHighlight) {
        setObsHighlight(obsId);
      }
    } else if (setObsHighlight) {
      // Clear the currently-hovered cell info by passing null.
      setObsHighlight(null);
    }
  };
}
