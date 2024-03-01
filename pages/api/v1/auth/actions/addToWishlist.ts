import withErrorHandling from "@/src/api-middlewares/withErrorHandling";
import apiErrorWithStatusCode from "@/src/api-utils/apiErrorWithStatusCode";
import getTokenFromReq from "@/src/api-utils/getTokenFromReq";
import Privy from "@/src/services/Privy";
import {
  IApiErrorResponse,
  IApiSuccessResponse,
  IUser,
} from "@/src/types";
import { userDocRef } from "@/src/utils/firestore_refs";
import type { NextApiHandler } from "next";

const handler: NextApiHandler<
  IApiSuccessResponse | IApiErrorResponse
> = async (req, res) => {

	const { bountyId } = req.body;

	if(!bountyId || typeof bountyId !== "string") {
		return res.status(400).json({ error: "Bounty id missing" });
	}

  const token = getTokenFromReq(req);

  if (!token) {
    return res.status(400).json({ error: "Token missing" });
  }

  const privy = new Privy();
  const userId = await privy.getUserId(token);

  if(!userId) {
    return res.status(400).json({ error: "Invalid token" });
  }
  
  const userDoc = await userDocRef(userId).get();

  const userData = userDoc.data() as IUser || {};

	if(userData.wishlist && userData.wishlist.includes(bountyId)) {
		return res.status(400).json({ error: "Bounty already in wishlist" });
	}

	const newUserData: any = {
		id: userId,
		wishlist: [...(userData.wishlist || []), bountyId],
	}

	if (!userDoc.exists) {
		newUserData.created_at = new Date();
		newUserData.updated_at = new Date();
	}

	await userDoc.ref.set(newUserData, { merge: true }).catch((error) => {
		throw apiErrorWithStatusCode(error.message, 500);
	});

  return res.status(200).json({ message: 'Bounty added to wishlist.' });
};

export default withErrorHandling(handler);
