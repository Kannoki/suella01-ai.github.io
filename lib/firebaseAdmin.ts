import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;

function getAdminApp(): App {
  if (_adminApp) return _adminApp;
  if (getApps().length > 0) {
    _adminApp = getApps()[0];
    return _adminApp;
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  if (!privateKey || !projectId || !clientEmail) {
    throw new Error(
      'Firebase Admin credentials are not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in your environment variables.'
    );
  }

  _adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Render escaped newlines from .env correctly
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });

  return _adminApp;
}

function getAdminDb(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}

function getAdminAuth(): Auth {
  if (!_adminAuth) {
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
}

// Proxies delay initialization until property/method access,
// preventing build-time crashes if environment variables are not yet populated.
export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    const db = getAdminDb();
    const val = Reflect.get(db, prop, receiver);
    return typeof val === 'function' ? val.bind(db) : val;
  },
});

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    const auth = getAdminAuth();
    const val = Reflect.get(auth, prop, receiver);
    return typeof val === 'function' ? val.bind(auth) : val;
  },
});
