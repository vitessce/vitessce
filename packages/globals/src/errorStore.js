const ERROR_STORAGE_KEY = 'vitessceGlobalErrors';
import log  from './globalSettings.js';
/**
 * Save an error to localStorage.
 * @param {Error} error - The error to save.
 */
export function saveError(error) {
  try {
    // Check if localStorage is available and working
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
 * @returns {Array} List of saved errors.
 */
export function getErrors() {
  try {
    // Ensure localStorage is available before reading from it
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
export function clearErrors() {
  try {
    // Check if localStorage is available before clearing
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ERROR_STORAGE_KEY);
    }
  } catch (e) {
    log.error('Error clearing errors from localStorage:', e);
  }
}
