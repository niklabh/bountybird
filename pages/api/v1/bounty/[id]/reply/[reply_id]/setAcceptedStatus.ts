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
	const { status } = req.body;

	if (
		!bountyId ||
		typeof bountyId !== 'string' ||
		!reply_id ||
		typeof reply_id !== 'string'
	) {
		return res.status(400).json({ error: 'Invalid bounty id or reply id' });
	}

	if (typeof status !== 'boolean') {
		return res.status(400).json({ error: 'Invalid status in req body.' });
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
	const privyUser = await privy.getPrivyUser(userId);

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

	//check if username is same as bounty username
	if (
		(bountyData.source === 'twitter' &&
			bountyData.username !== privyUser.twitter?.username) ||
		(bountyData.source === 'lens' &&
			bountyData.username !== userDocData.lens_handle) ||
		(bountyData.source === 'bounty bird' &&
			bountyData.username !== userDocData.username)
	) {
		return res.status(400).json({ error: 'Bounty does not belong to user' });
	}

	const newReply: IBountyReply = {
		...replyData,
		accepted: status,
		updated_at: new Date()
	};

	await replyDoc.ref.set(newReply, { merge: true }).catch((error) => {
		throw apiErrorWithStatusCode(error.message, 500);
	});

	return res.status(200).json({ message: 'Accepted status saved.' });
};

export default withErrorHandling(handler);
