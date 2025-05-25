import React from 'react';
import { Box, IconButton, Square as SquareIcon, MoreVert as MoreVertIcon } from '@vitessce/styles';
import { useTreeItem } from '@mui/x-tree-view/useTreeItem';
import { useTreeItemModel } from '@mui/x-tree-view/hooks';
import {
  TreeItemContent,
  TreeItemIconContainer,
  TreeItemGroupTransition,
  TreeItemLabel,
  TreeItemRoot,
  TreeItemCheckbox,
} from '@mui/x-tree-view/TreeItem';
import { TreeItemIcon } from '@mui/x-tree-view/TreeItemIcon';
import { TreeItemProvider } from '@mui/x-tree-view/TreeItemProvider';
import { TreeItemDragAndDropOverlay } from '@mui/x-tree-view/TreeItemDragAndDropOverlay';

import clsx from 'clsx';
import { range, isEqual } from 'lodash-es';
import { callbackOnKeyPress, colorArrayToString, getLevelTooltipText } from '@vitessce/sets-utils';
import { getDefaultColor } from '@vitessce/utils';


export const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getContextProviderProps,
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    status,
  } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref });

  const item = useTreeItemModel(itemId);

  const hexColor = (item.color ? colorArrayToString(item.color) : undefined);
  console.log(item, status);

  return (
    <TreeItemProvider {...getContextProviderProps()}>
      <TreeItemRoot {...getRootProps(other)}>
        <TreeItemContent {...getContentProps()}>
          <TreeItemIconContainer {...getIconContainerProps({
            sx: { color: hexColor }
          })}>
            {status.expandable ? <TreeItemIcon status={status} /> : <SquareIcon />}
          </TreeItemIconContainer>
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <TreeItemCheckbox {...getCheckboxProps()} />
            <TreeItemLabel {...getLabelProps()} />
            <IconButton size="small">
                <MoreVertIcon />
            </IconButton>
          </Box>
          <TreeItemDragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </TreeItemContent>
        {children && <TreeItemGroupTransition {...getGroupTransitionProps()} />}
      </TreeItemRoot>
    </TreeItemProvider>
  );
});
