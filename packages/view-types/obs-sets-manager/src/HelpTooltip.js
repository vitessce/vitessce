import React, { useRef } from 'react';
import RcTooltip from '@rc-component/tooltip';
import { useVitessceContainer } from '@vitessce/vit-s';
import { useHelpTooltipStyles, HelpTooltipGlobalStyles, PopoverGlobalStyles } from './styles.js';

/**
 * This is a small wrapper around the Tooltip component from the rc-tooltip library,
 * which is required to be able to apply theme styles to the tooltip.
 * The default `getTooltipContainer` function used by rc-tooltip
 * just returns `document.body` (see https://github.com/react-component/tooltip#props),
 * We want theme styles to be applied relative to the closest `.vitessce-container`
 * ancestor element.
 * https://github.com/vitessce/vitessce/pull/494#discussion_r395957914
 * @param {object} props Props are passed through to the <RcTooltip/> from the library.
 */
export default function HelpTooltip(props) {
  const {
    title,
    content,
    overlayClassName = 'helpTooltip',
    placement = 'top',
    trigger = 'hover',
    mouseEnterDelay = 0.2,
    mouseLeaveDelay = 0,
    destroyTooltipOnHide = true,
  } = props;
  const spanRef = useRef();
  const getTooltipContainer = useVitessceContainer(spanRef);

  const overlay = title || content;

  const { classes } = useHelpTooltipStyles();


  return (
    <>
      {overlayClassName === 'helpTooltip' ? (
        <HelpTooltipGlobalStyles classes={classes} />
      ) : (
        <PopoverGlobalStyles classes={classes} />
      )}
      <span ref={spanRef} />
      <RcTooltip
        {...props}
        placement={placement}
        trigger={trigger}
        mouseEnterDelay={mouseEnterDelay}
        mouseLeaveDelay={mouseLeaveDelay}
        destroyOnHidden={destroyTooltipOnHide}
        getTooltipContainer={getTooltipContainer}
        classNames={{ root: classes[overlayClassName] }}
        overlay={overlay}
      />
    </>
  );
}
