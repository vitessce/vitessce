// @ts-check
import { log } from '@vitessce/globals';
/**
 * Returns the directory part of a path,
 * (before the last '/' character).
 * @param {string} path
 * @returns {string}
 */
export function dirname(path) {
  const arr = path.split('/');
  arr.pop();
  return arr.join('/');
}

/**
 * Returns the last part of a path,
 * (after the last '/' character).
 * @param {string} path
 * @returns {string}
 */
export function basename(path) {
  const arr = path.split('/');
  const result = arr.at(-1);
  if (!result) {
    log.error('basename of path is empty', path);
    return '';
  }
  return result;
}
