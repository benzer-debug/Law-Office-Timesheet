/**
 * Validation module tests
 */

import {
  isValidEmail,
  validatePassword,
  isValidPhoneNumber,
  sanitizeInput,
  validateTimesheetData,
  getErrorMessage
} from '../validation.js';

describe('Validation Module', () => {
  describe('isValidEmail', () => {
    test('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should accept strong passwords', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject weak passwords', () => {
      const weakPassword = validatePassword('weak');
      expect(weakPassword.isValid).toBe(false);
      expect(weakPassword.errors.length).toBeGreaterThan(0);
    });

    test('should require uppercase letter', () => {
      const result = validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('should require lowercase letter', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    test('should require number', () => {
      const result = validatePassword('NoNumber');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    test('should require minimum 8 characters', () => {
      const result = validatePassword('Short1A');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });
  });

  describe('isValidPhoneNumber', () => {
    test('should accept valid phone numbers', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(true);
      expect(isValidPhoneNumber('(123) 456-7890')).toBe(true);
      expect(isValidPhoneNumber('+1-123-456-7890')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('abc')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    test('should escape HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;');
    });

    test('should preserve safe text', () => {
      const input = 'Hello World';
      expect(sanitizeInput(input)).toBe('Hello World');
    });
  });

  describe('validateTimesheetData', () => {
    test('should accept valid timesheet data', () => {
      const data = {
        date: '2026-02-23',
        startTime: '09:00',
        endTime: '17:00',
        description: 'Regular work day'
      };
      const result = validateTimesheetData(data);
      expect(result.isValid).toBe(true);
    });

    test('should reject missing date', () => {
      const data = {
        startTime: '09:00',
        endTime: '17:00'
      };
      const result = validateTimesheetData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Date is required');
    });

    test('should reject end time before start time', () => {
      const data = {
        date: '2026-02-23',
        startTime: '17:00',
        endTime: '09:00'
      };
      const result = validateTimesheetData(data);
      expect(result.isValid).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    test('should return string errors as-is', () => {
      expect(getErrorMessage('Custom error message')).toBe('Custom error message');
    });

    test('should translate Firebase auth errors', () => {
      const error = { code: 'auth/email-already-in-use' };
      expect(getErrorMessage(error)).toBe('This email is already registered.');
    });

    test('should handle unknown errors gracefully', () => {
      const error = { message: 'Unknown error' };
      expect(getErrorMessage(error)).toBe('Unknown error');
    });
  });
});
