
function base64Decode(encoded: string) {
  return Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
}

// This is intended to be used for unit testing purposes.
// It goes along with scripts/directory-to-memory-store.mjs
export function createStoreFromMapContents(mapContents: [string, string][]) {
  const map = new Map(mapContents);
  return new Proxy(map, {
    get: (target, prop) => {
      if(prop === 'get') {
        // Replace the get method with one that decodes the value.
        return (key: string) => {
          const encodedVal = target.get(key);
          if(encodedVal) {
            return base64Decode(encodedVal);
          }
          return undefined;
        };
      }
      return Reflect.get(target, prop);
    }
  });
}
