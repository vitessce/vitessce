export function dirname(path) {
  const arr = path.split('/');
  arr.pop();
  return arr.join('/');
}

export function basename(path) {
  const arr = path.split('/');
  return arr.at(-1);
}
