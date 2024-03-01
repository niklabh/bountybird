import { EReactionEmoji, IReaction } from "../types";
import nextApiClientFetch from "../utils/nextApiClientFetch";

export const likeBounty = async (id: any) => {
    const { data, error: fetchError } = await nextApiClientFetch<IReaction>(
        `api/v1/bounty/${id}/addReaction`,{
            reaction : EReactionEmoji.THUMBS_UP
        }
    );
    return {
        data, error: fetchError
    };
}

export const dislikeBounty = async (id: any) => {
    const { data, error: fetchError } = await nextApiClientFetch<IReaction>(
        `api/v1/bounty/${id}/removeReaction`
    );
    return {
        data, error: fetchError
    };
}