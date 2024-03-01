import withErrorHandling from "@/src/api-middlewares/withErrorHandling";
import getAllBountiesByIds from "@/src/api-utils/getAllBountiesByIds";
import getTokenFromReq from "@/src/api-utils/getTokenFromReq";
import Privy from "@/src/services/Privy";
import {
  IApiErrorResponse,
  IBountyListingResponse,
  IUser,
} from "@/src/types";
import { userDocRef } from "@/src/utils/firestore_refs";
import messages from "@/src/utils/messages";
import type { NextApiHandler } from "next";


// expects page, sortBy, proposalType and listingLimit
const handler: NextApiHandler<
  IBountyListingResponse | IApiErrorResponse
> = async (req, res) => {

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

  if(!userDoc.exists || !userDoc.data()) {
    return res.status(400).json({ error: "User not found" });
  }

  const userData = userDoc.data() as IUser;

  const wishlistIds = userData.wishlist || [];

  const { data, error, status } = await getAllBountiesByIds({
    bountyIds: wishlistIds
  });

  if (error || !data) {
    return res
      .status(status)
      .json({ error: error || messages.API_FETCH_ERROR });
  }
  
  return res.status(status).json(data);
};

export default withErrorHandling(handler);
