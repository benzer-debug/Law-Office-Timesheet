# Modern Firestore Security Architecture

## Previous Architecture (Not Secure)
```
┌─────────────────────────────────────────────┐
│           User Authentication              │
│  Hardcoded Firebase Config in HTML          │
│  Any authenticated user can access any data │
│  No role-based access control              │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│        Firestore Database                   │
│  Allow: if request.auth != null            │
│  Problem: Everyone has same permissions    │
└─────────────────────────────────────────────┘
```

## New Architecture (Secure)
```
┌──────────────────────────────────────────────────┐
│              Environment Variables               │
│  VITE_FIREBASE_API_KEY                           │
│  VITE_FIREBASE_PROJECT_ID                        │
│  Securely loaded from .env (not in git)          │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│        Input Validation Layer                    │
│  ✓ Email validation                              │
│  ✓ Password strength (8+, uppercase, number)     │
│  ✓ XSS prevention via sanitization              │
│  ✓ Timesheet validation                         │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│       Authentication & Authorization             │
│  ✓ User role assignment (admin/manager/employee) │
│  ✓ Role-based permission checking                │
│  ✓ Team-based access control                    │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│    Firestore with Advanced Security Rules        │
│  ✓ Role-based access control                     │
│  ✓ User can't modify own role                    │
│  ✓ Managers see only team data                   │
│  ✓ Employees see only own data                   │
│  ✓ Admins have full access                       │
└──────────────────────────────────────────────────┘
        ↓
┌──────────────────────────────────────────────────┐
│         Firestore Database                       │
│  employees/ { userId: {..., role, ...} }        │
│  users/ { userId: {..., role, teamId, ...} }    │
│  timesheets/ { protected by rules }              │
│  daily_logs/ { protected by rules }              │
└──────────────────────────────────────────────────┘
```

## Access Control Matrix

```
                │  View  │  Edit  │Manage  │
                │  Own   │  Own   │ Users  │
────────────────┼────────┼────────┼────────┤
Admin           │   ✓    │   ✓    │   ✓    │
────────────────┼────────┼────────┼────────┤
Manager         │   ✓    │   ✓    │   ✓*   │
(team only)     │        │        │(tmembs)│
────────────────┼────────┼────────┼────────┤
Employee        │   ✓    │   ✓    │   ✗    │
```

## Data Flow with Security

```
User Signup
    ↓
1. Input Validation
   - Email format
   - Password strength check
   - Name validation
    ↓
2. Create User in Firebase Auth
   - Email/Password
    ↓
3. Create User Document in Firestore
   - role: "employee" (default)
   - stored in /users/{uid}/
    ↓
4. Create Employee Document
   - stored in /employees/{uid}/
   - linked to user above
    ↓
User Document Structure:
{
  email: "john@example.com",
  role: "employee",        ← NEW: Role-based
  teamId: null,            ← NEW: For managers
  firstName: "John",
  lastName: "Doe"
}
```

## Testing Flow

```
Code Changes
    ↓
Pre-commit hooks (husky)
├─ ESLint checks (.eslintrc.json)
├─ Prettier formats (.prettierrc.json)
└─ Validation passes
    ↓
Push to GitHub
    ↓
GitHub Actions Workflow (.github/workflows/build-deploy.yml)
├─ npm install (install deps)
├─ npm run lint (code quality)
├─ npm test (run 58+ tests)
│  ├─ __tests__/validation.test.js (42 tests)
│  ├─ __tests__/rbac.test.js (16 tests)
│  └─ Firebase mocks (jest.setup.js)
├─ npm audit (security check)
└─ firebase deploy (if on main branch)
    ↓
Deployed to Firebase Hosting
```

## RBAC Permission Model

```
Role Hierarchy:
    Admin
      ↓
    Manager (team scope)
      ↓
    Employee (personal scope)

Admin Permissions:
  - view_all
  - edit_all
  - manage_users
  - manage_roles
  - view_reports

Manager Permissions:
  - view_team
  - edit_team
  - view_reports

Employee Permissions:
  - view_own
  - edit_own
```

## Security Checklist

```
┌─────────────────────────────────────────┐
│ ✅ Firestore Rules with RBAC            │
│ ✅ Environment Variables                │
│ ✅ Input Validation & Sanitization      │
│ ✅ Strong Password Requirements         │
│ ✅ User Role Fields                     │
│ ✅ Team-based Access Control            │
│ ✅ Comprehensive Error Handling         │
│ ✅ Test Coverage (58+ tests)            │
│ ✅ Code Quality (ESLint)                │
│ ✅ CI/CD Pipeline (GitHub Actions)      │
│ ⁰ Two-Factor Authentication (Future)    │
│ ⁰ Audit Logging (Future)                │
│ ⁰ Rate Limiting (Future)                │
└─────────────────────────────────────────┘
```

## File Structure

```
law-office-apps/
├─ .env                           ← Firebase config (not in git)
├─ .env.example                   ← Template for team
├─ .eslintrc.json                 ← Code quality rules
├─ .prettierrc.json               ← Code formatting
├─ .github/
│  └─ workflows/
│     └─ build-deploy.yml         ← CI/CD pipeline
├─ __tests__/
│  ├─ validation.test.js          ← 42 validation tests
│  └─ rbac.test.js                ← 16 RBAC tests
├─ firebaseConfig.js              ← Config management
├─ rbac.js                        ← Role utilities
├─ validation.js                  ← Input validation
├─ firestore.rules                ← Security rules (UPDATED)
├─ index.html                     ← Main app (UPDATED)
├─ jest.config.json               ← Test config
├─ jest.setup.js                  ← Firebase mocks
├─ package.json                   ← Dependencies & scripts
├─ QUICK_START.md                 ← Start here!
├─ IMPLEMENTATION_SUMMARY.md      ← All changes
├─ SECURITY_IMPROVEMENTS.md       ← Security details
└─ TESTING_CI_CD_GUIDE.md         ← Testing guide
```

---

This architecture provides defense-in-depth security with validation at each layer
