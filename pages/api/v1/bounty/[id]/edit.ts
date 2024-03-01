import { dayjs } from "@/src/dayjs-init";
import withErrorHandling from "@/src/api-middlewares/withErrorHandling";
import apiErrorWithStatusCode from "@/src/api-utils/apiErrorWithStatusCode";
import getTokenFromReq from "@/src/api-utils/getTokenFromReq";
import Privy from "@/src/services/Privy";
import {
  IApiErrorResponse,
  IApiSuccessResponse,
  IBounty,
  IUser,
} from "@/src/types";
import { bountyDocRef, userDocRef } from "@/src/utils/firestore_refs";
import type { NextApiHandler } from "next";

const handler: NextApiHandler<IApiSuccessResponse | IApiErrorResponse> = async (
  req,
  res
) => {
	const { id: bountyId } = req.query;
	const { status, task, amount, deadline, max_claims } = req.body;

	if (!bountyId || typeof bountyId !== 'string') {
		return res.status(400).json({ error: 'Bounty id invalid' });
	}

	const deadlineDate = deadline ? dayjs(deadline) : undefined;

	if (
		(status &&
			(typeof status !== 'string' || !['OPEN', 'CLOSED'].includes(status))) || //TODO: loop over BountyStatus enum instead
		(task && typeof task !== 'string') ||
		(amount && typeof amount !== 'string') ||
		(deadlineDate && !deadlineDate.isValid()) ||
		(max_claims && (isNaN(max_claims) || Number(max_claims) < 1))
	) {
		return res.status(400).json({ error: 'Invalid request body' });
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

	if (!userDoc.exists || !userDoc.data()) {
		return res.status(400).json({ error: 'User data not found.' });
	}

	const userData = (userDoc.data() as IUser) || {};

	const bountyDoc = await bountyDocRef(bountyId).get();
	const bountyData = bountyDoc?.data();

	if (!bountyDoc.exists || !bountyData) {
		return res.status(400).json({ error: 'Bounty Data not found' });
	}

	const bounty = {
		...bountyData,
		deadline: bountyData.deadline?.toDate(),
		created_at: bountyData.created_at.toDate(),
		updated_at: bountyData.updated_at.toDate()
	} as IBounty;

	if (
		(bounty.source === 'twitter' &&
			privyUser?.twitter?.username !== bounty.username) ||
		(bounty.source === 'lens' && userData.lens_handle !== bounty.username)
	) {
		return res.status(400).json({
			error: `Please link the correct ${bounty.source} account to edit this bounty.`
		});
	}

	const newBountyData: IBounty = {
		...bounty,
		status: status || bounty.status,
		task: task || bounty.task,
		amount: amount || bounty.amount,
		deadline: deadlineDate?.toDate() || bounty.deadline,
		max_claims: Number(max_claims) || bounty.max_claims,
		updated_at: new Date()
	};

	await bountyDoc.ref.set(newBountyData, { merge: true }).catch((error) => {
		throw apiErrorWithStatusCode(error.message, 500);
	});

	return res.status(200).json({ message: 'Bounty edited.' });
};

export default withErrorHandling(handler);
