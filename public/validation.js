/**
 * Input Validation and Security Utilities
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate phone number
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhoneNumber(phone) {
  // Accept various phone formats
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate timesheet data
 * @param {Object} data - Timesheet data object
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateTimesheetData(data) {
  const errors = [];

  if (!data.date) {
    errors.push('Date is required');
  }

  if (!data.startTime || !data.endTime) {
    errors.push('Start and end times are required');
  }

  if (data.startTime && data.endTime) {
    const start = new Date(`2000-01-01 ${data.startTime}`);
    const end = new Date(`2000-01-01 ${data.endTime}`);

    if (start >= end) {
      errors.push('End time must be after start time');
    }
  }

  if (data.description && data.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Format error messages for user display
 * @param {string|Object} error - Error object or message
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }

  if (error.code && error.code.startsWith('auth/')) {
    const authErrors = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Password is too weak.', 
      'auth/user-not-found': 'User not found.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many login attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };
    return authErrors[error.code] || error.message;
  }

  return error.message || 'An unexpected error occurred.';
}

export default {
  isValidEmail,
  validatePassword,
  isValidPhoneNumber,
  sanitizeInput,
  validateTimesheetData,
  getErrorMessage
};
