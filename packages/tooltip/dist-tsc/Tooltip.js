import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
import { Paper, Popper } from '@material-ui/core';
import { useVitessceContainer } from '@vitessce/vit-s';
import { styles } from './styles.js';
export default function Tooltip(props) {
    const { x, y, parentWidth, parentHeight, children, } = props;
    const ref = useRef();
    const classes = styles();
    const [placementX, setPlacementX] = useState('start');
    const [placementY, setPlacementY] = useState('bottom');
    const getTooltipContainer = useVitessceContainer(ref);
    // Do collision detection based on the bounds of the tooltip ancestor element.
    useEffect(() => {
        if (ref && ref.current) {
            const flipX = (x > parentWidth / 2);
            const flipY = (y > parentHeight / 2);
            setPlacementX(flipX ? 'end' : 'start');
            setPlacementY(flipY ? 'top' : 'bottom');
            ref.current.style.left = `${x + (flipX ? -20 : 5)}px`;
            ref.current.style.top = `${y + (flipY ? -20 : 5)}px`;
        }
    }, [x, y, parentWidth, parentHeight]);
    return (_jsx("div", { ref: ref, className: classes.tooltipAnchor, children: ref && ref.current ? (_jsx(Popper, { open: true, anchorEl: ref.current, container: getTooltipContainer, transition: true, placement: `${placementY}-${placementX}`, children: _jsx(Paper, { elevation: 4, className: classes.tooltipContent, children: children }) })) : null }));
}
