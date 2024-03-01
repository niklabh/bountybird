import withErrorHandling from '@/src/api-middlewares/withErrorHandling';
import apiErrorWithStatusCode from '@/src/api-utils/apiErrorWithStatusCode';
import getTokenFromReq from '@/src/api-utils/getTokenFromReq';
import Privy from '@/src/services/Privy';
import {
	EReactionEmoji,
	IApiErrorResponse,
	IApiSuccessResponse,
	IReaction
} from '@/src/types';
import { bountyDocRef, userDocRef } from '@/src/utils/firestore_refs';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler<IApiSuccessResponse | IApiErrorResponse> = async (
	req,
	res
) => {
	const { id: bountyId } = req.query;
	const { reaction } = req.body;

	if (!bountyId || typeof bountyId !== 'string') {
		return res.status(400).json({ error: 'Bounty id invalid' });
	}

	if (
		!reaction ||
		![EReactionEmoji.THUMBS_UP, EReactionEmoji.THUMBS_DOWN].includes(reaction)
	) {
		return res.status(400).json({ error: 'Invalid reaction in request body' });
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

	if (!userDoc.exists || !userDoc.data()) {
		return res.status(400).json({ error: 'User data not found.' });
	}

	const bountyDoc = await bountyDocRef(bountyId).get();
	const bountyData = bountyDoc?.data();

	if (!bountyDoc.exists || !bountyData) {
		return res.status(400).json({ error: 'Bounty Data not found' });
	}

	//check if reaction from this user already exists
	const reactionExists = (
		await bountyDoc.ref.collection('reactions').doc(userId).get()
	).exists;

	if (reactionExists) {
		return res.status(400).json({ error: 'Reaction already exists' });
	}

	const newReaction: IReaction = {
		user_id: userId,
		created_at: new Date(),
		reaction
	};

	await bountyDoc.ref
		.collection('reactions')
		.doc(userId)
		.set(newReaction, { merge: true })
		.catch((error) => {
			throw apiErrorWithStatusCode(error.message, 500);
		});

	return res.status(200).json({ message: 'Reaction added to bounty.' });
};

export default withErrorHandling(handler);