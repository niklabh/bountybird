import withErrorHandling from '@/src/api-middlewares/withErrorHandling';
import LISTING_LIMIT from '@/src/constants/listingLimit';
import {
	BountySource,
	BountyStatus,
	IApiErrorResponse,
	IApiResponse,
	IBounty,
	IBountyListingResponse,
	IReaction
} from '@/src/types';
import { bountiesCollRef } from '@/src/utils/firestore_refs';
import messages from '@/src/utils/messages';
import type { NextApiHandler } from 'next';

export async function getBounties({
	page = 1,
	listingLimit,
	bountyStatus,
	username,
	bountySource
}: {
	page: number;
	listingLimit: number;
	bountyStatus?: BountyStatus;
	username?: string[];
	bountySource?: BountySource;
}): Promise<IApiResponse<IBountyListingResponse>> {
	try {
		let totalCountQuery = bountiesCollRef().orderBy('created_at', 'desc');

		let bountiesRef = bountiesCollRef()
			.orderBy('deleted')
			.where('deleted', '!=', true)
			.orderBy('created_at', 'desc')
			.limit(listingLimit)
			.offset((Number(page) - 1) * Number(listingLimit || LISTING_LIMIT));

		if (username && Array.isArray(username)) {
			bountiesRef = bountiesRef.where('username', 'in', username);
			totalCountQuery = totalCountQuery.where('username', 'in', username);
		}

		if (bountyStatus) {
			bountiesRef = bountiesRef.where('status', '==', bountyStatus);
			totalCountQuery = bountiesRef.where('status', '==', bountyStatus);
		}

		if (bountySource) {
			bountiesRef = bountiesRef.where('source', '==', bountySource);
			totalCountQuery = bountiesRef.where('source', '==', bountySource);
		}

		const bountiesDocs = (await bountiesRef.get()).docs;

		const bounties: IBounty[] = [];

		for (const doc of bountiesDocs) {
			const docData = doc.data();

			if (!docData) continue;

			const reactions = (await doc.ref.collection('reactions').get()).docs.map((doc) => {
				const docData = doc.data();
				return { ...docData, created_at: docData?.created_at?.toDate?.() } as IReaction;
			});

			const repliesCount =
				(await doc.ref.collection('replies').where('deleted', '!=', true).count().get()).data().count || 0;

			bounties.push({
				...docData,
				created_at: docData.created_at.toDate(),
				updated_at: docData.updated_at.toDate(),
				deadline: docData.deadline?.toDate(),
				reactions,
				replies_count: repliesCount
			} as IBounty);
		}

		const totalCount: number = (await totalCountQuery.count().get()).data().count || 0;

		const data: IBountyListingResponse = {
			totalCount,
			bounties
		};

		return {
			data,
			error: null,
			status: 200
		};
	} catch (error: any) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
}

// expects page, sortBy, proposalType and listingLimit
const handler: NextApiHandler<IBountyListingResponse | IApiErrorResponse> = async (req, res) => {
	const { page = 1, listingLimit = LISTING_LIMIT, bountyStatus, username, bountySource } = req.body;

	const pageNum = Number(page);
	const listingLimitNum = Number(listingLimit);

	if (!page || isNaN(pageNum) || !listingLimit || isNaN(listingLimitNum)) {
		return res.status(400).json({ error: 'Invalid params in request body' });
	}

	if (bountyStatus && !Object.values(BountyStatus).includes(bountyStatus)) {
		return res.status(400).json({ error: 'Invalid bounty status' });
	}

	if (username && !Array.isArray(username)) {
		return res.status(400).json({ error: 'Invalid username' });
	}

	if (bountySource && !['lens', 'twitter'].includes(bountySource)) {
		return res.status(400).json({ error: 'Invalid bounty source' });
	}

	const { data, error, status } = await getBounties({
		page: pageNum,
		listingLimit: listingLimitNum,
		bountyStatus: bountyStatus as BountyStatus,
		username: username as string[],
		bountySource: bountySource as BountySource
	});

	if (error || !data) {
		return res.status(status).json({ error: error || messages.API_FETCH_ERROR });
	}

	return res.status(status).json(data);
};

export default withErrorHandling(handler);
