
import * as firebaseAdmin from 'firebase-admin';

if (!process.env.FIREBASE_SERVICE_ACC_CONFIG) {
	throw new Error('Internal Error: FIREBASE_SERVICE_ACC_CONFIG missing.');
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACC_CONFIG) as firebaseAdmin.ServiceAccount;

try {
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert(serviceAccount)
	});
	console.log('Firebase admin Initialized.');
} catch (error: any) {
	// Skipping the "already exists" message which is not an actual error when we're hot-reloading.
	if (!/already exists/u.test(error?.message || '')) {
		console.error('Firebase admin initialization error : ', error);
	}
}

export const firestore_db = firebaseAdmin.firestore();

export default firebaseAdmin;
