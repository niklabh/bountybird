import withErrorHandling from '@/src/api-middlewares/withErrorHandling';
import apiErrorWithStatusCode from '@/src/api-utils/apiErrorWithStatusCode';
import getTokenFromReq from '@/src/api-utils/getTokenFromReq';
import Privy from '@/src/services/Privy';
import { IApiErrorResponse, IApiSuccessResponse, IBounty, IBountyReply, IUser } from '@/src/types';
import { bountyDocRef, userDocRef } from '@/src/utils/firestore_refs';
import type { NextApiHandler } from 'next';

const handler: NextApiHandler<IApiSuccessResponse | IApiErrorResponse> = async (req, res) => {
	const { id: bountyId } = req.query;
	const { text } = req.body;

	if (!bountyId || typeof bountyId !== 'string') {
		return res.status(400).json({ error: 'Bounty id invalid' });
	}

	if (!text || typeof text !== 'string' || text.trim().length < 1) {
		return res.status(400).json({ error: 'Invalid text in request body' });
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

	const newReplyRef = bountyDoc.ref.collection('replies').doc();

	const newReply: IBountyReply = {
		id: newReplyRef.id,
		created_at: new Date(),
		updated_at: new Date(),
		source_author_id: userDocData.id,
		display_name: userDocData.name || '',
		username: userDocData.username || '',
		text: text.trim(),
		source: 'bounty bird',
		deleted: false
	};

	await newReplyRef.set(newReply).catch((error) => {
		throw apiErrorWithStatusCode(error.message, 500);
	});

	return res.status(200).json({ message: 'Reply added to bounty.' });
};

export default withErrorHandling(handler);
