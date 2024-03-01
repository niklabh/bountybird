import { IBounty } from "../types";
import nextApiClientFetch from "../utils/nextApiClientFetch";

export const getBountyById = async (id: any) => {
    const { data, error: fetchError } = await nextApiClientFetch<IBounty>(
        `api/v1/bounty/${id}`
    );
    return {
        data, error: fetchError
    };
}