import React from 'react';
import { useCoordination, useWarning } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import TitleInfo from '../TitleInfo';
import Status from './Status';

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
export default function StatusSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Status',
  } = props;

  // Get "props" from the coordination space.
  const [{
    cellHighlight,
    geneHighlight,
    moleculeHighlight,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.status, coordinationScopes);

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
      removeGridComponent={removeGridComponent}
      isScroll
      isReady
    >
      <Status warn={warn} info={info} />
    </TitleInfo>
  );
}
