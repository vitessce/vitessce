/*
 * This is the Popper component from MUI v4 which uses Popper.js v1.
 * The Popper in MUI v7 uses Popper.js v2 and does not seem to respect the anchorEl's positioning,
 * which is the reason we copy the v4 version here.
 * Reference: https://github.com/mui/material-ui/blob/v4.x/packages/material-ui/src/Popper/Popper.js
 */
import * as React from 'react';
import PopperJs from 'popper.js';
import { useStyles as useTheme } from 'tss-react/mui';
import { Portal } from '@mui/material';
import { createChainedFunction, setRef, useForkRef } from './utils.js';

function flipPlacement(placement, theme) {
  const direction = (theme && theme.direction) || 'ltr';

  if (direction === 'ltr') {
    return placement;
  }

  switch (placement) {
    case 'bottom-end':
      return 'bottom-start';
    case 'bottom-start':
      return 'bottom-end';
    case 'top-end':
      return 'top-start';
    case 'top-start':
      return 'top-end';
    default:
      return placement;
  }
}

function getAnchorEl(anchorEl) {
  return typeof anchorEl === 'function' ? anchorEl() : anchorEl;
}

const useEnhancedEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

const defaultPopperOptions = {};

/**
 * Poppers rely on the 3rd party library [Popper.js](https://popper.js.org/docs/v1/) for positioning.
 */
export const Popper = React.forwardRef((props, ref) => {
  const {
    anchorEl,
    children,
    container,
    disablePortal = false,
    keepMounted = false,
    modifiers,
    open,
    placement: initialPlacement = 'bottom',
    popperOptions = defaultPopperOptions,
    popperRef: popperRefProp,
    style,
    transition = false,
    ...other
  } = props;
  const tooltipRef = React.useRef(null);
  const ownRef = useForkRef(tooltipRef, ref);

  const popperRef = React.useRef(null);
  const handlePopperRef = useForkRef(popperRef, popperRefProp);
  const handlePopperRefRef = React.useRef(handlePopperRef);
  useEnhancedEffect(() => {
    handlePopperRefRef.current = handlePopperRef;
  }, [handlePopperRef]);
  React.useImperativeHandle(popperRefProp, () => popperRef.current, []);

  const [exited, setExited] = React.useState(true);

  const { theme } = useTheme();
  const rtlPlacement = flipPlacement(initialPlacement, theme);
  /**
   * placement initialized from prop but can change during lifetime if modifiers.flip.
   * modifiers.flip is essentially a flip for controlled/uncontrolled behavior
   */
  const [placement, setPlacement] = React.useState(rtlPlacement);

  React.useEffect(() => {
    if (popperRef.current) {
      popperRef.current.update();
    }
  });

  const handleOpen = React.useCallback(() => {
    if (!tooltipRef.current || !anchorEl || !open) {
      return;
    }

    if (popperRef.current) {
      popperRef.current.destroy();
      handlePopperRefRef.current(null);
    }

    const handlePopperUpdate = (data) => {
      setPlacement(data.placement);
    };

    const resolvedAnchorEl = getAnchorEl(anchorEl);

    if (process.env.NODE_ENV !== 'production') {
      if (resolvedAnchorEl && resolvedAnchorEl.nodeType === 1) {
        const box = resolvedAnchorEl.getBoundingClientRect();

        if (
          process.env.NODE_ENV !== 'test'
          && box.top === 0
          && box.left === 0
          && box.right === 0
          && box.bottom === 0
        ) {
          console.warn(
            [
              'Material-UI: The `anchorEl` prop provided to the component is invalid.',
              'The anchor element should be part of the document layout.',
              "Make sure the element is present in the document or that it's not display none.",
            ].join('\n'),
          );
        }
      }
    }

    const popper = new PopperJs(getAnchorEl(anchorEl), tooltipRef.current, {
      placement: rtlPlacement,
      ...popperOptions,
      modifiers: {
        ...(disablePortal
          ? {}
          : {
            // It's using scrollParent by default, we can use the viewport when using a portal.
            preventOverflow: {
              boundariesElement: 'window',
            },
          }),
        ...modifiers,
        ...popperOptions.modifiers,
      },
      // We could have been using a custom modifier like react-popper is doing.
      // But it seems this is the best public API for this use case.
      onCreate: createChainedFunction(handlePopperUpdate, popperOptions.onCreate),
      onUpdate: createChainedFunction(handlePopperUpdate, popperOptions.onUpdate),
    });

    handlePopperRefRef.current(popper);
  }, [anchorEl, disablePortal, modifiers, open, rtlPlacement, popperOptions]);

  const handleRef = React.useCallback(
    (node) => {
      setRef(ownRef, node);
      handleOpen();
    },
    [ownRef, handleOpen],
  );

  const handleEnter = () => {
    setExited(false);
  };

  const handleClose = () => {
    if (!popperRef.current) {
      return;
    }

    popperRef.current.destroy();
    handlePopperRefRef.current(null);
  };

  const handleExited = () => {
    setExited(true);
    handleClose();
  };

  React.useEffect(() => () => {
    handleClose();
  }, []);

  React.useEffect(() => {
    if (!open && !transition) {
      // Otherwise handleExited will call this.
      handleClose();
    }
  }, [open, transition]);

  if (!keepMounted && !open && (!transition || exited)) {
    return null;
  }

  const childProps = { placement };

  if (transition) {
    childProps.TransitionProps = {
      in: open,
      onEnter: handleEnter,
      onExited: handleExited,
    };
  }

  return (
    <Portal disablePortal={disablePortal} container={container}>
      <div
        ref={handleRef}
        role="tooltip"
        {...other}
        style={{
          // Prevents scroll issue, waiting for Popper.js to add this style once initiated.
          position: 'fixed',
          // Fix Popper.js display issue
          top: 0,
          left: 0,
          display: !open && keepMounted && !transition ? 'none' : null,
          ...style,
        }}
      >
        {typeof children === 'function' ? children(childProps) : children}
      </div>
    </Portal>
  );
});
