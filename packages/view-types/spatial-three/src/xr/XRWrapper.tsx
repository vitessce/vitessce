/* eslint-disable react/no-unknown-property */
import React from 'react';
import { getXRModule } from './xrModule.js';
import { xrStore } from './xrStore.js';

const { XR } = getXRModule();

export default function XRWrapper({ children }: { children: React.ReactNode }) {
  return (
    <XR store={xrStore}>
      {children}
    </XR>
  );
}
