import { getAccessToken } from "@privy-io/react-auth";
import messages from "./messages";
import { IBounty } from "../types";

async function isWishlistBounty<T>(
  method?: "GET" | "POST"
): Promise<{ data?: string[]; error?: string }> {
  const currentURL = new URL(window.location.href);
  //if we store auth token in local storage:  const token = currentURL.searchParams.get('token') || auth_token;
  const token =
    currentURL.searchParams.get("token") || (await getAccessToken()) || "";

  const response = await fetch(
    `${window.location.origin}/api/v1/auth/data/wishlist`,
    {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      method: method || "POST",
    }
  );

  const { message, bounties } = await response.json();
  
  const isWishlists = bounties?.map(
    (bounty: IBounty) => bounty.id
    );
    
  if (response.status === 200)
    return {
      data: isWishlists,
    };

  return {
    error:
      message || messages.API_FETCH_ERROR || "unable to fetch wishlist data",
  };
}

export default isWishlistBounty;
