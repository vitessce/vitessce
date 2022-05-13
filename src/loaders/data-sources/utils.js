
export function dirname(path) {
  const pathParts = path.split('/');
  pathParts.pop();
  return pathParts.join('/');
}
