# Final Polish Checklist (Production-Ready)

Use this checklist before final deployment. It is scoped to preserve current functionality while improving reliability, security, and maintainability.

## 1) Security and Access Control

- [ ] Deploy latest `firestore.rules`
- [ ] Verify employees can read/write only their own `daily_logs` and `monthly_records`
- [ ] Verify manager/admin access paths still work as expected
- [ ] Confirm no sensitive secrets are hardcoded in source-controlled files

## 2) Firestore Query Performance

- [ ] Deploy `firestore.indexes.json` after query updates
- [ ] Confirm `daily_logs` fetch uses `uid + date range` query (no full collection scan)
- [ ] Confirm `monthly_records` fetch uses `uid` query (no full collection scan)
- [ ] Validate fallback behavior still works if index propagation is delayed

## 3) Input Hardening

- [ ] Validate sanitized task text is saved and reloaded correctly
- [ ] Validate incentive source sanitization and required project/client enforcement
- [ ] Confirm bonus/advance amount handling allows only numeric values and valid totals

## 4) Functional Regression (Critical Paths)

- [ ] Login and logout flows (including inactivity warning actions)
- [ ] Generate timesheet with date range and status changes
- [ ] Save and load timesheet (including incentives, bonus, advances)
- [ ] Generate PDF and send via email
- [ ] Monthly records listing and recalculation

## 5) Observability and Release

- [ ] Check browser console for uncaught errors during full workflow
- [ ] Run `npm test`
- [ ] Run `npm run lint`
- [ ] Deploy to staging first, then production
- [ ] Record release notes and rollback steps

## Quick Commands

- `npm install`
- `npm test`
- `npm run lint`
- `firebase deploy --only firestore:indexes,firestore:rules`
