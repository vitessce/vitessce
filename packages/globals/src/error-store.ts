import { log } from './global-settings.js';

const ERROR_STORAGE_KEY = 'vitessceGlobalErrors';

/**
 * Save an error to localStorage.
 * @param {Record<string, any>} error
 */
export function saveError(error: Record<string, any>) {
  try {
    if (typeof localStorage !== 'undefined') {
      const existingErrors = JSON.parse(localStorage.getItem(ERROR_STORAGE_KEY) || '[]');
      existingErrors.push(error);

      localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(existingErrors));
    }
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

/**
 * Retrieve all saved errors.
 * @returns {Array<Record<string, any>>}
 */
export function getErrors(): Array<Record<string, any>> {
  try {
    if (typeof localStorage !== 'undefined') {
      const savedErrors = localStorage.getItem(ERROR_STORAGE_KEY);
      return savedErrors ? JSON.parse(savedErrors) : [];
    }
    return [];
  } catch (e) {
    log.error('Error retrieving errors from localStorage:', e);
    return [];
  }
}

/**
 * Clear all saved errors.
 */
export function clearErrors(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ERROR_STORAGE_KEY);
    }
  } catch (e) {
    log.error('Error clearing errors from localStorage:', e);
  }
}
