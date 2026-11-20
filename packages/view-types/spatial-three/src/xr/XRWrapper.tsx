/* eslint-disable react/no-unknown-property */
import React from 'react';
import { getXRModule } from './xrModule.js';
import { getXrStore } from './xrStore.js';

export default function XRWrapper({ children }: { children: React.ReactNode }) {
  const { XR } = getXRModule();
  return (
    <XR store={getXrStore()}>
      {children}
    </XR>
  );
}
