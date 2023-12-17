import { FilterCenterFocusOutlined, PanToolOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { SELECTION_TYPE } from '@vitessce/gl';
import { SelectLassoIconSVG } from '@vitessce/icons';


export default function ToolMenu(props) {
  const {
    setActiveTool,
    activeTool,
    visibleTools = { pan: true, selectLasso: true },
    recenterOnClick = () => {},
  } = props;

  const onRecenterButtonCLick = () => {
    recenterOnClick();
  };

  return (
    <div style={{zIndex: 99}}>
      {visibleTools.pan && (
        <IconButton
          alt="Click For Pan Tool"
          color="secondary"
          // disabled={!activeTool}
          onClick={() => setActiveTool(null)}
        ><PanToolOutlined />
        </IconButton>
      )}
      {visibleTools.selectLasso && (
        <IconButton
          alt="Click For Lasso Tool"
          disabled={activeTool === SELECTION_TYPE.POLYGON}
          onClick={() => setActiveTool(SELECTION_TYPE.POLYGON)}
        ><SelectLassoIconSVG />
        </IconButton>
      )}
      <IconButton
        alt="Click To Recenter"
        onClick={() => onRecenterButtonCLick()}
        aria-label="Recenter scatterplot view"
      ><FilterCenterFocusOutlined />
      </IconButton>
    </div>
  );
}
