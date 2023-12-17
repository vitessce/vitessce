import {
  TitleInfo,
  useCoordination,
  useReady,
} from '@vitessce/vit-s';
import { COMPONENT_COORDINATION_TYPES, ViewType } from '@vitessce/constants-internal';
import GeneInfo from './GeneInfo.js';

/**
 * A subscriber component for a text description component.
 * Also renders a table containing image metadata.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function GeneInfoSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title,
  } = props;

  const [{
    featureHighlight,
  },
  ] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.GENE_INFO], coordinationScopes);

  const isReady = useReady([true]);

  return (
    <TitleInfo
      title={title}
      isScroll
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <GeneInfo
        gene={featureHighlight}
      />
    </TitleInfo>
  );
}
