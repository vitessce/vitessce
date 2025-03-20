import React from 'react';

export function VolumeHUD({
  volumeInfo = {},
  renderingMode = 'default',
  renderingStats = {},
}) {
  return (
    <div style={{
      position: 'absolute',
      top: 8,
      left: 8,
      fontSize: '12px',
      color: 'white',
      background: 'rgba(0,0,0,0.5)',
      padding: '4px 8px',
      borderRadius: '4px',
      zIndex: 10,
      pointerEvents: 'none',
      userSelect: 'none',
      maxWidth: '250px',
    }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        Volume Renderer
      </div>
      <div>Mode: {renderingMode}</div>
      {volumeInfo.dimensions && (
        <div>Dimensions: {volumeInfo.dimensions.join(' × ')}</div>
      )}
      {renderingStats.fps && (
        <div>FPS: {renderingStats.fps.toFixed(1)}</div>
      )}
    </div>
  );
}
