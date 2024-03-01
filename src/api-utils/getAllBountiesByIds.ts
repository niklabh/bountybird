import { firestore_db } from '../services/firebase_init';
import { IApiResponse, IBounty, IBountyListingResponse, IBountyReply, IReaction } from '../types';
import { bountyDocRef } from '../utils/firestore_refs';
import messages from '../utils/messages';
import apiErrorWithStatusCode from './apiErrorWithStatusCode';

export default async function getAllBountiesByIds({
	bountyIds,
	fetchReplies = false,
	fetchReactions = true
}: {
	bountyIds: string[];
	fetchReplies?: boolean;
	fetchReactions?: boolean;
}): Promise<IApiResponse<IBountyListingResponse>> {
	try {
		if (!bountyIds.length) {
			throw apiErrorWithStatusCode('No bounty ids provided', 400);
		}

		const bountiesRefs = bountyIds.map((bountyId) => bountyDocRef(bountyId));

		const results = await firestore_db.getAll(...bountiesRefs);

		const bounties: IBounty[] = [];

		for (const doc of results) {
			const docData = doc.data();

			if (!doc.exists || !docData || docData.deleted) continue;

			const repliesArr: IBountyReply[] = [];
			const reactionsArr: IReaction[] = [];

			if (fetchReplies) {
				const replies = await doc.ref.collection('replies').where('deleted', '!=', true).get();

				replies.forEach((reply) => {
					const replyData = reply.data();

					repliesArr.push({
						...replyData,
						created_at: replyData.created_at.toDate(),
						updated_at: replyData.updated_at.toDate()
					} as IBountyReply);
				});
			}

			if (fetchReactions) {
				const reactions = await doc.ref.collection('reactions').get();

				reactions.forEach((reaction) => {
					const reactionData = reaction.data();

					reactionsArr.push({
						...reactionData,
						created_at: reactionData.created_at.toDate()
					} as IReaction);
				});
			}

			bounties.push({
				...docData,
				created_at: docData.created_at.toDate(),
				updated_at: docData.updated_at.toDate(),
				deadline: docData.deadline?.toDate(),
				replies: repliesArr,
				reactions: reactionsArr
			} as IBounty);
		}

		const data: IBountyListingResponse = {
			totalCount: bounties.length,
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
