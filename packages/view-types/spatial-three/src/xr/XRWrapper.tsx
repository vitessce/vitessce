/* eslint-disable react/no-unknown-property */
import React from 'react';
import { XR } from '@react-three/xr';
import { xrStore } from './xrStore.js';

export default function XRWrapper({ children }: { children: React.ReactNode }) {
  return (
    <XR store={xrStore}>
      {children}
    </XR>
  );
}
