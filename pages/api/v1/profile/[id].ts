import withErrorHandling from '@/src/api-middlewares/withErrorHandling';
import Algolia from '@/src/services/algolia';
import { IApiErrorResponse, IUser } from '@/src/types';
import { userDocRef } from '@/src/utils/firestore_refs';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler<IUser | IApiErrorResponse> = async (req, res) => {
	const { id } = req.query;
	const { usernameSource } = req.body;

	if (!id || Array.isArray(id) || typeof id !== 'string') {
		return res.status(400).json({ error: 'Invalid id or username' });
	}

	if (id?.startsWith('did:privy')) {
		const doc = await userDocRef(id).get()
		if (doc.exists) {
			const user = doc.data() as any;
			if (user) {
				user.created_at = user?.created_at?.toDate() || user?.created_at || null;
				user.updated_at = user?.updated_at?.toDate() || user?.updated_at || null;
				return res.status(200).json(user);
			}
		}
	}

	if (
		usernameSource &&
		(typeof usernameSource !== 'string' || Array.isArray(usernameSource))
	) {
		return res.status(400).json({ error: 'Invalid usernameSource' });
	}

	const algolia = new Algolia();
	const { users } = await algolia.getUsers(5, 0, undefined, id);
	let user: IUser | null = null;

	if (users && Array.isArray(users)) {
		if (usernameSource === 'twitter') {
			user = users.find((user) => user.privy_user?.twitter?.username?.toLowerCase() === id?.toLowerCase()) || null;
		} else if (usernameSource === 'lens') {
			user = users.find((user) => user.lens_handle?.toLowerCase() === id?.toLowerCase()) || null;
		} else {
			user = users.find((user) => user?.id === id || user.username?.toLowerCase() === id?.toLowerCase() || user?.privy_user?.linkedAccounts?.some((acc) => (acc as any).address?.toLowerCase() === id?.toLowerCase())) || null;
		}
	}

	if (!user) {
		return res.status(404).json({ error: 'User not found' });
	}

	user.created_at = user?.created_at;
	user.updated_at = user?.updated_at;

	return res.status(200).json(user);
};

export default withErrorHandling(handler);
