import { IUser } from "../types";
import nextApiClientFetch from "../utils/nextApiClientFetch";

export const getProfileFromId = async (id: any) => {
    const { data, error: fetchError } = await nextApiClientFetch<IUser>(
        `api/v1/profile/${id}`
    );
    return {
        data, error: fetchError
    };
}