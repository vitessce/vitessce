import React from 'react';

export function VolumeHUD({
  volumeInfo = {},
  renderingMode = 'default',
  renderingStats = {},
  zarrStoreInfo = null,
  deviceLimits = null,
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
      maxWidth: '350px',
      maxHeight: '80vh',
      overflowY: 'auto',
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

      {/* Zarr Store Information */}
      {zarrStoreInfo && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Zarr Store Info
          </div>
          <div>Data Type: {zarrStoreInfo.dtype || 'Unknown'}</div>
          {zarrStoreInfo.chunkSize && (
            <div>Chunk Size: {JSON.stringify(zarrStoreInfo.chunkSize)}</div>
          )}
          {zarrStoreInfo.resolutions && (
            <div>Resolutions: {zarrStoreInfo.resolutions.join(', ')}</div>
          )}
          {zarrStoreInfo.shapes && zarrStoreInfo.shapes.length > 0 && (
            <div>
              Base Shape: {JSON.stringify(zarrStoreInfo.shapes[0])}
            </div>
          )}
          {zarrStoreInfo.physicalSizeVoxel && zarrStoreInfo.physicalSizeVoxel.length > 0 && (
            <div>
              Physical Size (per voxel): {zarrStoreInfo.physicalSizeVoxel.map(v => v.toFixed(2)).join(' × ')}
            </div>
          )}
          {zarrStoreInfo.physicalSizeTotal && zarrStoreInfo.physicalSizeTotal.length > 0 && (
            <div>
              Physical Size (in total): {zarrStoreInfo.physicalSizeTotal.map(v => v.toFixed(2)).join(' × ')}
            </div>
          )}
        </div>
      )}

      {/* Device Limits */}
      {deviceLimits && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Device Limits
          </div>
          <div>Max Texture Size: {deviceLimits.maxTextureSize || 'Unknown'}</div>
          <div>Max 3D Texture Size: {deviceLimits.max3DTextureSize || 'Unknown'}</div>
          <div>Max Renderbuffer Size: {deviceLimits.maxRenderbufferSize || 'Unknown'}</div>
        </div>
      )}
    </div>
  );
}
