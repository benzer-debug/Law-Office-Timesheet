# Testing & CI/CD Setup Guide

## Overview

This project now has complete testing and continuous integration/deployment (CI/CD) setup with:

- **Jest** for unit testing
- **ESLint** for code quality
- **Prettier** for code formatting
- **GitHub Actions** for automated CI/CD
- **Pre-commit hooks** for automatic checks

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs all development and production dependencies defined in `package.json`.

### 2. Setup Pre-commit Hooks (Optional)

```bash
npm install -g husky@8
husky install
```

This sets up automatic linting and formatting before each commit.

## Running Tests

### Run All Tests

```bash
npm test
```

### Watch Mode (Auto-rerun on file changes)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

This generates a coverage report showing how much of the code is tested.

## Code Quality

### Lint Code

```bash
npm run lint
```

### Auto-fix Linting Issues

```bash
npm run lint:fix
```

### Format Code with Prettier

```bash
npm run format
```

## Test Structure

Tests are located in the `__tests__/` directory:

- `__tests__/validation.test.js` - Tests for input validation functions
- `__tests__/rbac.test.js` - Tests for role-based access control

### Running Specific Tests

```bash
# Run validation tests only
npm test -- validation.test.js

# Run RBAC tests only
npm test -- rbac.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should accept valid emails"
```

## Writing New Tests

### Test File Structure

Create a new file in `__tests__/` directory with `.test.js` extension:

```javascript
// __tests__/myModule.test.js
import { myFunction } from '../myModule.js';

describe('My Module', () => {
  describe('myFunction', () => {
    test('should work correctly', () => {
      expect(myFunction('input')).toBe('expected output');
    });

    test('should handle edge cases', () => {
      expect(myFunction('')).toBe('default');
    });
  });
});
```

### Common Test Patterns

```javascript
// Basic assertions
expect(value).toBe(expectedValue);
expect(value).toEqual(expectedObject);
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Arrays and objects
expect(array).toContain(element);
expect(array).toHaveLength(3);
expect(obj).toHaveProperty('key');

// Functions
expect(() => throwingFunction()).toThrow();

// Promises
test('async test', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});
```

## GitHub Actions CI/CD

The project includes automated GitHub Actions workflow that:

1. **Runs Tests** on every push and pull request
2. **Lints Code** to ensure quality
3. **Audits Dependencies** for security vulnerabilities
4. **Deploys to Firebase** on successful tests to main branch

### Setup GitHub Actions

1. Create GitHub Secrets for Firebase deployment:
   - `FIREBASE_TOKEN` - Get via `firebase login:ci`
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`

2. Push to main branch to trigger deployment

### Workflow File

The workflow is configured in `.github/workflows/build-deploy.yml`

## Configuration Files

### `.eslintrc.json`
- ESLint configuration for code quality rules
- Based on Google's style guide
- Customized for this project's needs

### `.prettierrc.json`
- Prettier configuration for consistent code formatting
- 2-space indentation
- 100 character line width

### `jest.config.json`
- Jest test runner configuration
- Browser environment for DOM testing

### `jest.setup.js`
- Firebase mocks for testing
- Global test configuration

## Docker Support (Optional)

To run tests in Docker:

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run lint
RUN npm test
```

## Firestore Security Rules Testing

To test Firestore rules locally:

```bash
npm install -D @firebase/rules-unit-testing
```

Then create a test file like `__tests__/firestore.rules.test.js`:

```javascript
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import * as fs from 'fs';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'law-office-apps',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules', () => {
  test('user can read own data', async () => {
    const db = testEnv.authenticatedContext('user-1').firestore();
    await assertSucceeds(db.collection('employees').doc('user-1').get());
  });

  test('user cannot read other user data', async () => {
    const db = testEnv.authenticatedContext('user-1').firestore();
    await assertFails(db.collection('employees').doc('user-2').get());
  });
});
```

## Best Practices

1. **Write Tests First** - Write tests before implementing features (TDD)
2. **Keep Tests Focused** - Each test should test one thing
3. **Use Descriptive Names** - Test names should clearly describe what they test
4. **Test Edge Cases** - Include tests for empty inputs, null values, errors
5. **Mock External Services** - Mock Firebase and APIs in tests
6. **Maintain Coverage** - Aim for >80% code coverage

## Continuous Integration Checklist

- [ ] All tests passing
- [ ] ESLint passing with no errors
- [ ] Code coverage >80%
- [ ] No security vulnerabilities
- [ ] Firestore rules tested
- [ ] Deployment successful

## Troubleshooting

### Tests Not Running
```bash
# Clear Jest cache
npm test -- --clearCache

# Update node modules
rm -rf node_modules package-lock.json
npm install
```

### Import Errors in Tests
- Ensure Firebase mocks are properly configured in `jest.setup.js`
- Check that test files import from correct paths
- Use `npm test -- --verbose` for detailed error messages

### GitHub Actions Failing
- Check workflow logs in GitHub Actions tab
- Verify all secrets are set correctly
- Ensure Firebase token is valid: `firebase login:ci`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
