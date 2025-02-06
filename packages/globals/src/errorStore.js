const ERROR_STORAGE_KEY = 'vitessceGlobalErrors';

/**
 * Save an error to localStorage.
 */
export function saveError(error) {
  const existingErrors = JSON.parse(localStorage.getItem(ERROR_STORAGE_KEY) || '[]');
  existingErrors.push({
    message: error.message || error.toString(),
    stack: error.stack || null,
    name: error?.name || 'Error',
    fileType: error?.file_type,
    dataset: error.dataset,

  });
  localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(existingErrors));
}

/**
 * Retrieve all saved errors.
 */
export function getErrors() {
  return JSON.parse(localStorage.getItem(ERROR_STORAGE_KEY) || '[]');
}

/**
 * Clear all saved errors.
 */
export function clearErrors() {
  localStorage.removeItem(ERROR_STORAGE_KEY);
}
