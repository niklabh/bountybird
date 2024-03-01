import { firestore_db } from "../services/firebase_init";

export const bountiesCollRef = () => firestore_db.collection('bounties');
export const bountyDocRef = (id: string) => bountiesCollRef().doc(id);
export const bountyRepliesCollRef = (id: string) => bountyDocRef(id).collection('replies');

export const usersCollRef = () => firestore_db.collection('users');
export const userDocRef = (id: string) => usersCollRef().doc(id);
