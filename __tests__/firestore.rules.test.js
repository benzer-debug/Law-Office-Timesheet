/**
 * @jest-environment node
 */

import fs from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';

const projectId = 'law-office-apps-rules-test';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || '';
const hasEmulator = Boolean(emulatorHost);
const runIfEmulator = hasEmulator ? describe : describe.skip;

let testEnv;

runIfEmulator('Firestore Security Rules', () => {
  beforeAll(async () => {
    const [host, portRaw] = emulatorHost.split(':');
    const port = Number(portRaw || 8080);

    testEnv = await initializeTestEnvironment({
      projectId,
      firestore: {
        host,
        port,
        rules: fs.readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  async function seedUser(userId, role = 'employee', teamId = 'team-a', hasTimesheets = false) {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', userId), { role, teamId });
      await setDoc(doc(db, 'employees', userId), { role, teamId, hasTimesheets });
    });
  }

  test('employee can create own valid daily log', async () => {
    await seedUser('emp-1', 'employee', 'team-a');

    const db = testEnv.authenticatedContext('emp-1').firestore();

    await assertSucceeds(setDoc(doc(db, 'daily_logs', 'log-1'), {
      uid: 'emp-1',
      userId: 'emp-1',
      date: '2026-03-11',
      timeIn: '09:00:00',
      timeOut: null,
      note: 'On time'
    }));
  });

  test('employee cannot create daily log for another user', async () => {
    await seedUser('emp-1', 'employee', 'team-a');

    const db = testEnv.authenticatedContext('emp-1').firestore();

    await assertFails(setDoc(doc(db, 'daily_logs', 'log-2'), {
      uid: 'emp-2',
      userId: 'emp-2',
      date: '2026-03-11',
      timeIn: '09:00',
      timeOut: null
    }));
  });

  test('employee cannot create daily log with invalid time', async () => {
    await seedUser('emp-1', 'employee', 'team-a');

    const db = testEnv.authenticatedContext('emp-1').firestore();

    await assertFails(setDoc(doc(db, 'daily_logs', 'log-3'), {
      uid: 'emp-1',
      userId: 'emp-1',
      date: '2026-03-11',
      timeIn: '25:99',
      timeOut: null
    }));
  });

  test('employee can read own monthly record but not another user record', async () => {
    await seedUser('emp-1', 'employee', 'team-a');
    await seedUser('emp-2', 'employee', 'team-b');

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'monthly_records', 'emp-1_2026-03'), {
        uid: 'emp-1',
        userId: 'emp-1',
        month: '03',
        year: 2026,
        monthKey: '2026-03',
        totalHours: 160,
        daysWorked: 20
      });
      await setDoc(doc(db, 'monthly_records', 'emp-2_2026-03'), {
        uid: 'emp-2',
        userId: 'emp-2',
        month: '03',
        year: 2026,
        monthKey: '2026-03',
        totalHours: 150,
        daysWorked: 19
      });
    });

    const emp1Db = testEnv.authenticatedContext('emp-1').firestore();

    await assertSucceeds(getDoc(doc(emp1Db, 'monthly_records', 'emp-1_2026-03')));
    await assertFails(getDoc(doc(emp1Db, 'monthly_records', 'emp-2_2026-03')));
  });

  test('employee can create own valid timesheet payload', async () => {
    await seedUser('emp-1', 'employee', 'team-a');

    const db = testEnv.authenticatedContext('emp-1').firestore();

    await assertSucceeds(setDoc(doc(db, 'employees', 'emp-1', 'timesheets', '2026-03-01_2026-03-31'), {
      uid: 'emp-1',
      empName: 'Employee One',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      dailyRate: 800,
      otMultiplier: 1.25,
      timesheetData: [
        {
          date: '2026-03-01',
          timeIn: '09:00',
          timeOut: '18:00',
          task: 'Drafting',
          status: 'Present',
          amount: 800
        }
      ],
      salaryAdvances: [{ amount: 500 }],
      incentives: [{ amount: 300, source: 'Client A' }],
      bonuses: [{ amount: 200 }],
      totalAdvances: 500,
      totalIncentives: 300,
      totalBonuses: 200,
      totalAmount: 800,
      savedAt: new Date()
    }));
  });

  test('employee cannot create timesheet with uid mismatch in own path', async () => {
    await seedUser('emp-1', 'employee', 'team-a');

    const db = testEnv.authenticatedContext('emp-1').firestore();

    await assertFails(setDoc(doc(db, 'employees', 'emp-1', 'timesheets', '2026-03-01_2026-03-31'), {
      uid: 'emp-2',
      empName: 'Employee One',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      dailyRate: 800,
      otMultiplier: 1.25,
      timesheetData: [],
      totalAmount: 0,
      savedAt: new Date()
    }));
  });

  test('employee cannot create timesheet with invalid date format', async () => {
    await seedUser('emp-1', 'employee', 'team-a');

    const db = testEnv.authenticatedContext('emp-1').firestore();

    await assertFails(setDoc(doc(db, 'employees', 'emp-1', 'timesheets', 'invalid'), {
      uid: 'emp-1',
      empName: 'Employee One',
      startDate: '03-01-2026',
      endDate: '2026-03-31',
      dailyRate: 800,
      otMultiplier: 1.25,
      timesheetData: [],
      totalAmount: 0,
      savedAt: new Date()
    }));
  });

  test('employee cannot elevate own role in employees document', async () => {
    await seedUser('emp-1', 'employee', 'team-a');

    const db = testEnv.authenticatedContext('emp-1').firestore();

    await assertFails(setDoc(doc(db, 'employees', 'emp-1'), {
      role: 'manager'
    }, { merge: true }));
  });

  test('employee cannot save manager/admin title in position', async () => {
    await seedUser('emp-1', 'employee', 'team-a');

    const db = testEnv.authenticatedContext('emp-1').firestore();

    await assertFails(setDoc(doc(db, 'employees', 'emp-1'), {
      position: 'Manager'
    }, { merge: true }));
  });

  test('admin can assign manager role in employees document', async () => {
    await seedUser('admin-1', 'admin', 'hq');
    await seedUser('emp-1', 'employee', 'team-a');

    const db = testEnv.authenticatedContext('admin-1').firestore();

    await assertSucceeds(setDoc(doc(db, 'employees', 'emp-1'), {
      role: 'manager'
    }, { merge: true }));
  });

  test('employee cannot unset hasTimesheets flag once true', async () => {
    await seedUser('emp-1', 'employee', 'team-a', true);

    const db = testEnv.authenticatedContext('emp-1').firestore();

    await assertFails(setDoc(doc(db, 'employees', 'emp-1'), {
      hasTimesheets: false
    }, { merge: true }));
  });

  test('admin cannot assign manager role when user has timesheets flag', async () => {
    await seedUser('admin-1', 'admin', 'hq');
    await seedUser('emp-1', 'employee', 'team-a', true);

    const db = testEnv.authenticatedContext('admin-1').firestore();

    await assertFails(setDoc(doc(db, 'employees', 'emp-1'), {
      role: 'manager'
    }, { merge: true }));

    await assertFails(setDoc(doc(db, 'users', 'emp-1'), {
      role: 'manager'
    }, { merge: true }));
  });

  test('admin can assign manager role when user has no timesheets flag', async () => {
    await seedUser('admin-1', 'admin', 'hq');
    await seedUser('emp-1', 'employee', 'team-a', false);

    const db = testEnv.authenticatedContext('admin-1').firestore();

    await assertSucceeds(setDoc(doc(db, 'employees', 'emp-1'), {
      role: 'manager'
    }, { merge: true }));

    await assertSucceeds(setDoc(doc(db, 'users', 'emp-1'), {
      role: 'manager'
    }, { merge: true }));
  });
});

describe('Firestore Security Rules (local Jest)', () => {
  test('skips rules tests when emulator host is not configured', () => {
    if (!hasEmulator) {
      expect(process.env.FIRESTORE_EMULATOR_HOST).toBeUndefined();
      return;
    }

    expect(hasEmulator).toBe(true);
  });
});
