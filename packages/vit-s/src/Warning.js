import styled from '@emotion/styled';
import { VITESSCE_CONTAINER } from './classNames.js';

const WarningLayout = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.gridLayoutBackground,
  position: 'absolute',
  width: '100%',
  height: '100vh',
}));

const FluidWarningLayout = styled(WarningLayout)({
  width: '100%',
  padding: '15px',
  marginRight: 'auto',
  marginLeft: 'auto',
  boxSizing: 'border-box',
  display: 'flex',
});

const Row = styled('div')({
  flexGrow: '1',
});

const WarningCard = styled('div')(({ theme }) => ({
  border: `1px solid ${theme.palette.cardBorder}`,
  flex: '1 1 auto',
  minHeight: '1px',
  padding: '12px',
  marginTop: '8px',
  marginBottom: '8px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '0',
  wordWrap: 'break-word',
  backgroundClip: 'border-box',
  borderRadius: '4px',
  backgroundColor: theme.palette.primaryBackground,
  color: theme.palette.primaryForeground,
}));


export function Warning(props) {
  const {
    title,
    preformatted,
    unformatted,
  } = props;
  return (
    <div className={VITESSCE_CONTAINER}>
      <FluidWarningLayout>
        <Row>
          <WarningCard>
            <h1>{title}</h1>
            {preformatted ? (<pre>{preformatted}</pre>) : null}
            <p>{unformatted}</p>
          </WarningCard>
        </Row>
      </FluidWarningLayout>
    </div>
  );
}
