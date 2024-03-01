import withErrorHandling from '@/src/api-middlewares/withErrorHandling';
import apiErrorWithStatusCode from '@/src/api-utils/apiErrorWithStatusCode';
import getTokenFromReq from '@/src/api-utils/getTokenFromReq';
import Privy from '@/src/services/Privy';
import {
	IApiErrorResponse,
	IApiSuccessResponse,
	IBounty,
	IBountyReply,
	IUser
} from '@/src/types';
import { bountyDocRef, userDocRef } from '@/src/utils/firestore_refs';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler<IApiSuccessResponse | IApiErrorResponse> = async (
	req,
	res
) => {
	const { id: bountyId, reply_id } = req.query;
	const { text } = req.body;

	if (
		!bountyId ||
		typeof bountyId !== 'string' ||
		!reply_id ||
		typeof reply_id !== 'string'
	) {
		return res.status(400).json({ error: 'Invalid bounty id or reply id' });
	}

	if (!text || typeof text !== 'string' || text.trim().length < 1) {
		return res.status(400).json({ error: 'Invalid text' });
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
	const userDocData = userDoc?.data() as IUser;

	if (!userDoc.exists || !userDocData) {
		return res.status(400).json({ error: 'User data not found.' });
	}

	const bountyDoc = await bountyDocRef(bountyId).get();
	const bountyData = bountyDoc?.data() as IBounty;

	if (!bountyDoc.exists || !bountyData) {
		return res.status(400).json({ error: 'Bounty Data not found' });
	}

	const replyDoc = await bountyDoc.ref
		.collection('replies')
		.doc(reply_id)
		.get();

	const replyData = replyDoc?.data() as IBountyReply;

	if (!replyDoc.exists || !replyData) {
		return res.status(400).json({ error: 'Reply data not found' });
	}

	if (replyData.source_author_id !== userId) {
		return res.status(400).json({ error: 'Reply does not belong to user' });
	}

	const newReply: IBountyReply = {
		...replyData,
		text: text.trim(),
		updated_at: new Date()
	};

	await replyDoc.ref.set(newReply, { merge: true }).catch((error) => {
		throw apiErrorWithStatusCode(error.message, 500);
	});

	return res.status(200).json({ message: 'Reply edited.' });
};

export default withErrorHandling(handler);
