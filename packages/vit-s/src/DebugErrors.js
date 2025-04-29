import { useDebugError } from './state/hooks';
import { getDebugMode } from '@vitessce/globals';

export function DebugErrors(props) {
  const debugError = useDebugError()
  const viewError = debugError?.filter(err => err?.uid === props?.uid)
  console.log("debugRE", debugError, props, viewError, getDebugMode())
  if (viewError?.length > 0 && getDebugMode())  {
    throw viewError[0]
  }
 return null
}
