export function dirname(path) {
  const arr = path.split('/');
  arr.pop();
  return arr.join('/');
}
