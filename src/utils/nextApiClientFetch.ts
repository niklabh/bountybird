import { getAccessToken } from "@privy-io/react-auth";
import messages from "./messages";

async function nextApiClientFetch<T>(
  url: string,
  data?: { [key: string]: any },
  method?: "GET" | "POST"
): Promise<{ data?: T; error?: string }> {
  const currentURL = new URL(window.location.href);
  //if we store auth token in local storage:  const token = currentURL.searchParams.get('token') || auth_token;
  const token =
    currentURL.searchParams.get("token") || (await getAccessToken()) || "";

  const response = await fetch(`${window.location.origin}/${url}`, {
    body: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    method: method || "POST",
  });

  const resJSON = await response.json();

  if (response.status === 200)
    return {
      data: resJSON as T,
    };

  return {
    error: resJSON.error || resJSON.message || messages.API_FETCH_ERROR,
  };
}

export default nextApiClientFetch;
