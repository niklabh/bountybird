import { PrivyClient } from '@privy-io/server-auth';
import convertFirestoreTimestampToDate from '../utils/convertFirestoreTimestampToDate';
import { IUser } from '../types';
import { userDocRef } from '../utils/firestore_refs';
import { redisGet } from './redis';

export const getUserRedisKey = (userId: string) => {
	return `townhall:${process.env.NEXT_PUBLIC_INDEXES_PREFIX === 'dev_'? 'dev': 'prod'}:user:${userId}`;
};

class Privy {
	private privy: PrivyClient;

	constructor() {
		this.privy = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID || '', process.env.PRIVY_APP_SECRET || '');
	}

	async verifyAuthToken(token: string) {
		return this.privy.verifyAuthToken(token);
	}

	async getUserId(token: string) {
		const verifiedClaims = await this.verifyAuthToken(token);
		return verifiedClaims.userId;
	}

	async getPrivyUser(userId: string) {
		return this.privy.getUser(userId);
	}

	async getPrivyUserByWalletAddress(address: string) {
		return this.privy.getUserByWalletAddress(address);
	}

	async getTownhallUser(userId: string): Promise<IUser | null> {
		const dataStr = await redisGet(getUserRedisKey(userId));
		if (dataStr) {
			const data = JSON.parse(dataStr) as IUser;
			if (data.created_at) {
				data.created_at = new Date(data.created_at);
			}
			if (data.updated_at) {
				data.updated_at = new Date(data.updated_at);
			}
			return data;
		}
		const doc = await userDocRef(userId).get();
		if (doc.exists) {
			const data = doc.data() as IUser;
			if (data) {
				data.created_at = convertFirestoreTimestampToDate(data.created_at);
				data.updated_at = convertFirestoreTimestampToDate(data.updated_at);
				return data;
			}
		}
		return null;
	}
}
export default Privy;