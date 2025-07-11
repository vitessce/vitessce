import { getDebugMode } from '@vitessce/globals';
import { useDebugError } from './state/hooks.js';

export function DebugErrors({ uid }) {
  const debugError = useDebugError();
  const viewError = debugError?.filter(err => err?.uid === uid);
  if (viewError?.length > 0 && getDebugMode()) {
    throw viewError[0];
  }
  return null;
}
