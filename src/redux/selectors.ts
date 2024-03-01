import { useSelector } from "react-redux";
import { IProfileStore } from "./profile/@types";
import { TAppState } from "./store";

const useProfileSelector = () => {
	const profile = useSelector<TAppState, IProfileStore>((state) => state.profile);
	return profile;
};

export { useProfileSelector }