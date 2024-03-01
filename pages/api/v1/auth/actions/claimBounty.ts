import withErrorHandling from '@/src/api-middlewares/withErrorHandling';
import apiErrorWithStatusCode from '@/src/api-utils/apiErrorWithStatusCode';
import getTokenFromReq from '@/src/api-utils/getTokenFromReq';
import Privy from '@/src/services/Privy';
import { firestore_db } from '@/src/services/firebase_init';
import { IApiErrorResponse, IApiSuccessResponse, IBounty, IUser } from '@/src/types';
import { bountyDocRef, userDocRef } from '@/src/utils/firestore_refs';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler<IApiSuccessResponse | IApiErrorResponse> = async (req, res) => {
	const { bountyId } = req.body;

	if (!bountyId || typeof bountyId !== 'string') {
		return res.status(400).json({ error: 'Bounty id missing' });
	}

	const bountyDoc = await bountyDocRef(bountyId).get();

	if (!bountyDoc.exists || !bountyDoc.data()) {
		return res.status(400).json({ error: 'Invalid bounty id' });
	}

	const bountyData = bountyDoc.data() as IBounty;

	if (bountyData.status !== 'OPEN' || bountyData.deleted) {
		return res.status(400).json({ error: 'Bounty is not open or deleted.' });
	}

	const claims = bountyData.claims || [];

	if (claims.length >= bountyData.max_claims) {
		return res.status(400).json({ error: 'Bounty is already claimed.' });
	}

	const token = getTokenFromReq(req);

	if (!token) {
		return res.status(400).json({ error: 'Token missing' });
	}

	const privy = new Privy();
	const userId = await privy.getUserId(token);

	if (!userId) {
		return res.status(400).json({ error: 'Invalid token' });
	}

	const userDoc = await userDocRef(userId).get();
	const privyUser = await privy.getPrivyUser(userId);

	const batch = firestore_db.batch();

	if (!userDoc.exists || !userDoc.data()) {
		const newUserData: IUser = {
			id: userId,
			created_at: new Date(),
			updated_at: new Date(),
			wishlist: [],
			privy_user: JSON.parse(JSON.stringify(privyUser))
		} as any;

		batch.set(userDoc.ref, newUserData, { merge: true });
	}

	batch.update(bountyDoc.ref, {
		claims: [
			...claims,
			{
				user_id: userId,
				created_at: new Date()
			}
		]
	});

	await batch.commit().catch((error) => {
		throw apiErrorWithStatusCode(error.message, 500);
	});

	return res.status(200).json({ message: 'Bounty claimed.' });
};

export default withErrorHandling(handler);
