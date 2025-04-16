import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { makeStyles, MenuItem } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { PopperMenu } from '@vitessce/vit-s';
const useStyles = makeStyles(() => ({
    addButton: {
        marginTop: '10px',
        marginBottom: '10px',
        fontWeight: 400,
    },
}));
function ImageAddIcon() {
    return (_jsxs(_Fragment, { children: [_jsx(AddIcon, {}), "Add Image Layer"] }));
}
function ImageAddButton({ imageOptions, handleImageAdd }) {
    const [open, setOpen] = useState(false);
    const classes = useStyles();
    const handleAdd = (imgData) => {
        setOpen(prev => !prev);
        handleImageAdd(imgData);
    };
    if (!imageOptions)
        return null;
    return (_jsx(PopperMenu, { open: open, setOpen: setOpen, buttonIcon: _jsx(ImageAddIcon, {}), buttonClassName: classes.addButton, placement: "bottom-start", "aria-label": "Add image menu", children: imageOptions.map((imgData, i) => (_jsx(MenuItem, { dense: true, onClick: () => handleAdd(i), children: _jsx("span", { children: imgData.name }) }, imgData.name))) }));
}
export default ImageAddButton;
