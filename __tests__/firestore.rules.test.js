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

  async function seedUser(userId, role = 'employee', teamId = 'team-a') {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', userId), { role, teamId });
      await setDoc(doc(db, 'employees', userId), { role, teamId });
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
