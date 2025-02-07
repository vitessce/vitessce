import React, { useCallback } from 'react';
import { useId } from 'react-aria';
import { debounce } from 'lodash-es';
import {
  TableCell,
  TableRow,
  Slider,
} from '@mui/material';
import {
  InputCell, LabelCell, Checkbox, OptionsContainer, CellColorEncodingOption, StyledOptionSelect,
  SliderValueLabel,
} from '@vitessce/vit-s';
import styled from '@emotion/styled';
import { GLSL_COLORMAPS } from '@vitessce/gl';


const CameraLabel = styled(TableCell)({
  padding: '0px 0px 0px 16px',
});

const ToggleBox = styled(TableCell)({
  padding: '0px',
});

const ToggleFixedAxisButton = ({
  setSpatialAxisFixed,
  spatialAxisFixed,
  use3d,
}) => {
  const toggleAxisId = useId();
  return (
    <TableRow>
      <CameraLabel variant="head" scope="row">
        <label
          htmlFor={`spatial-camera-axis-${toggleAxisId}`}
        >
          Fix Camera Axis
        </label>
      </CameraLabel>
      <ToggleBox variant="body">
        <Checkbox
          onClick={() => setSpatialAxisFixed(!spatialAxisFixed)}
          disabled={!use3d}
          checked={Boolean(spatialAxisFixed)}
          inputProps={{
            'aria-label': 'Fix or not fix spatial camera axis',
            id: `spatial-camera-axis-${toggleAxisId}`,
          }}
        />
      </ToggleBox>
    </TableRow>
  );
};

export default function SpatialOptions(props) {
  const {
    observationsLabel,
    cellColorEncoding,
    setCellColorEncoding,
    setSpatialAxisFixed,
    spatialAxisFixed,
    use3d,
    tooltipsVisible,
    setTooltipsVisible,
    geneExpressionColormap,
    setGeneExpressionColormap,
    geneExpressionColormapRange,
    setGeneExpressionColormapRange,
    canShowExpressionOptions,
    canShowColorEncodingOption,
    canShow3DOptions,
  } = props;

  const spatialOptionsId = useId();

  function handleGeneExpressionColormapChange(event) {
    setGeneExpressionColormap(event.target.value);
  }

  const handleColormapRangeChange = useCallback((event, value) => {
    setGeneExpressionColormapRange(value);
  }, [setGeneExpressionColormapRange]);

  const handleColormapRangeChangeDebounced = useCallback(
    debounce(handleColormapRangeChange, 5, { trailing: true }),
    [handleColormapRangeChange],
  );

  function handleTooltipsVisibilityChange(event) {
    setTooltipsVisible(event.target.checked);
  }


  return (
    <OptionsContainer>
      {canShowColorEncodingOption ? (
        <CellColorEncodingOption
          observationsLabel={observationsLabel}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
        />
      ) : null}
      {canShow3DOptions ? (
        <ToggleFixedAxisButton
          setSpatialAxisFixed={setSpatialAxisFixed}
          spatialAxisFixed={spatialAxisFixed}
          use3d={use3d}
        />
      ) : null}
      <TableRow>
        <LabelCell variant="head" scope="row">
          <label
            htmlFor={`gene-expression-colormap-option-tooltip-visibility-${spatialOptionsId}`}
          >
            Tooltips Visible
          </label>
        </LabelCell>
        <InputCell variant="body">
          <Checkbox
              /**
               * We have to use "checked" here, not "value".
               * The checkbox state is not persisting with value.
               * For reference, https://v4.mui.com/api/checkbox/
               */
            checked={tooltipsVisible}
            onChange={handleTooltipsVisibilityChange}
            name="gene-expression-colormap-option-tooltip-visibility"
            color="default"
            inputProps={{
              'aria-label': 'Enable or disable tooltips',
              id: `gene-expression-colormap-option-tooltip-visibility-${spatialOptionsId}`,
            }}
          />
        </InputCell>
      </TableRow>
      {canShowExpressionOptions ? (
        <>
          <TableRow>
            <LabelCell variant="head" scope="row">
              <label
                htmlFor={`gene-expression-colormap-select-${spatialOptionsId}`}
              >
                Gene Expression Colormap
              </label>
            </LabelCell>
            <InputCell variant="body">
              <StyledOptionSelect
                key="gene-expression-colormap-select"
                value={geneExpressionColormap}
                onChange={handleGeneExpressionColormapChange}
                inputProps={{
                  id: `gene-expression-colormap-select-${spatialOptionsId}`,
                }}
              >
                {GLSL_COLORMAPS.map(cmap => (
                  <option key={cmap} value={cmap}>{cmap}</option>
                ))}
              </StyledOptionSelect>
            </InputCell>
          </TableRow>
          <TableRow>
            <LabelCell variant="head" scope="row">
              <label
                htmlFor={`gene-expression-colormap-range-${spatialOptionsId}`}
              >
                Gene Expression Colormap Range
              </label>
            </LabelCell>
            <InputCell variant="body">
              <Slider
                components={{
                  ValueLabel: SliderValueLabel,
                }}
                value={geneExpressionColormapRange}
                onChange={handleColormapRangeChangeDebounced}
                getAriaLabel={(index) => {
                  const labelPrefix = index === 0 ? 'Low value slider' : 'High value slider';
                  return `${labelPrefix} for spatial gene expression colormap range`;
                }}
                id={`gene-expression-colormap-range-${spatialOptionsId}`}
                valueLabelDisplay="auto"
                step={0.005}
                min={0.0}
                max={1.0}
              />
            </InputCell>
          </TableRow>
        </>
      ) : null}
    </OptionsContainer>
  );
}
