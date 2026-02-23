// Jest setup file
// Add any global test configuration here

// Mock Firebase
jest.mock('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js', () => ({
  initializeApp: jest.fn(() => ({
    name: 'DEFAULT'
  }))
}));

jest.mock('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

jest.mock('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn()
}));

// Suppress console errors in tests (optional)
global.console.error = jest.fn();
global.console.warn = jest.fn();
