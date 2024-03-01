import withErrorHandling from '@/src/api-middlewares/withErrorHandling';
import getAllBountiesByIds from '@/src/api-utils/getAllBountiesByIds';
import { IApiErrorResponse, IBounty } from '@/src/types';
import messages from '@/src/utils/messages';
import type { NextApiHandler } from 'next';

// expects page, sortBy, proposalType and listingLimit
const handler: NextApiHandler<IBounty | IApiErrorResponse> = async (
	req,
	res
) => {
	const { id: bountyId } = req.query;

	if (!bountyId || Array.isArray(bountyId) || typeof bountyId !== 'string') {
		return res.status(400).json({ error: 'Invalid bounty id' });
	}

	const { data, error, status } = await getAllBountiesByIds({
		bountyIds: [bountyId],
		fetchReplies: true
	});

	if (error || !data) {
		return res
			.status(status)
			.json({ error: error || messages.API_FETCH_ERROR });
	}

	if (!data.bounties.length) {
		return res.status(404).json({ error: 'Bounty not found' });
	}

	return res.status(status).json(data.bounties[0]);
};

export default withErrorHandling(handler);
