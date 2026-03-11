/**
 * Input Validation and Security Utilities
 */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

function toSafeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidDateString(dateValue) {
  if (!DATE_REGEX.test(dateValue)) {
    return false;
  }

  const [year, month, day] = dateValue.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

function parseTimeToMinutes(timeValue) {
  if (!TIME_REGEX.test(timeValue)) {
    return null;
  }

  const [hours, minutes] = timeValue.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = email.trim();
  if (!normalizedEmail || normalizedEmail.length > 254) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalizedEmail);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];

  if (typeof password !== 'string') {
    errors.push('Password is required');
    return {
      isValid: false,
      errors: errors
    };
  }

  const normalizedPassword = password.trim();

  if (normalizedPassword.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(normalizedPassword)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(normalizedPassword)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(normalizedPassword)) {
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
  if (typeof phone !== 'string') {
    return false;
  }

  const normalizedPhone = phone.trim();
  if (!normalizedPhone) {
    return false;
  }

  // Accept various phone formats
  const phoneRegex = /^[\d\s\-+()]+$/;
  const digitCount = normalizedPhone.replace(/\D/g, '').length;
  return phoneRegex.test(normalizedPhone) && digitCount >= 10 && digitCount <= 15;
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  const safeInput = input == null ? '' : String(input);

  if (typeof document === 'undefined') {
    return safeInput
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const div = document.createElement('div');
  div.textContent = safeInput;
  return div.innerHTML;
}

/**
 * Validate timesheet data
 * @param {Object} data - Timesheet data object
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateTimesheetData(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid timesheet payload']
    };
  }

  const date = toSafeString(data.date);
  const startTime = toSafeString(data.startTime);
  const endTime = toSafeString(data.endTime);
  const description = typeof data.description === 'string' ? data.description.trim() : '';

  if (!date) {
    errors.push('Date is required');
  } else if (!isValidDateString(date)) {
    errors.push('Date must be in YYYY-MM-DD format and valid');
  }

  if (!startTime || !endTime) {
    errors.push('Start and end times are required');
  }

  if (startTime && endTime) {
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (startMinutes === null || endMinutes === null) {
      errors.push('Time must be in HH:MM or HH:MM:SS format');
    } else if (startMinutes >= endMinutes) {
      errors.push('End time must be after start time');
    } else if (endMinutes - startMinutes > 24 * 60) {
      errors.push('Shift duration cannot exceed 24 hours');
    }
  }

  if (description.length > 500) {
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

  if (!error || typeof error !== 'object') {
    return 'An unexpected error occurred.';
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
