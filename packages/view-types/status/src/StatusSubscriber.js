import React from 'react';
import {
  TitleInfo, useCoordination, useWarning,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import Status from './Status.js';

/**
 * A subscriber component for the status component,
 * which renders hovered cell/gene/molecule information
 * as well as schema validation and data loading errors.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function StatusSubscriber(props) {
  const {
    coordinationScopes,
    closeButtonVisible,
    removeGridComponent,
    theme,
    title = 'Status',
    helpText = ViewHelpMapping.STATUS,
  } = props;

  // Get "props" from the coordination space.
  const [{
    obsHighlight: cellHighlight,
    featureHighlight: geneHighlight,
    moleculeHighlight,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.STATUS], coordinationScopes);

  const warn = useWarning();

  const infos = [
    ...(cellHighlight
      ? [`Hovered cell ${cellHighlight}`]
      : []
    ),
    ...(geneHighlight
      ? [`Hovered gene ${geneHighlight}`]
      : []
    ),
    ...(moleculeHighlight
      ? [`Hovered gene ${moleculeHighlight}`]
      : []
    ),
  ];
  const info = infos.join('; ');

  return (
    <TitleInfo
      title={title}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      removeGridComponent={removeGridComponent}
      isScroll
      isReady
      helpText={helpText}
    >
      <Status warn={warn} info={info} />
    </TitleInfo>
  );
}
