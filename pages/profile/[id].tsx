import {
  IBounty,
  IUser,
  NotificationStatus,
  IBountyListingResponse,
} from "@/src/types";
import Link from "next/link";
import { notification } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import { LeftOutlined } from "@ant-design/icons";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import nextApiClientFetch from "@/src/utils/nextApiClientFetch";
import { useRouter } from "next/router";
import LoadingState from "@/src/components/ui-components/LoadingState";
import queueNotification from "@/src/components/ui-components/QueueNotification";
import BountyCard from "@/src/components/ui-components/BountyCard";
import SEOHead from "@/src/global/SEOHead";
import { useProfileSelector } from "@/src/redux/selectors";
import isWishlistBounty from "@/src/utils/isWishlistBounty";

const Profile = () => {
  const router = useRouter();
  const { id: profileId, source } = router.query;
	const [wishlists, setWishlists] = useState<string[]>([]);
  const { authenticated: isUserAuthenticated, ready, user: privyUser } = usePrivy();
	const { privy_loading, user } = useProfileSelector();
  const [loading, setLoading] = useState<boolean>(false);
  const [bountiesLoading, setBountiesLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<IUser | null>(null);
  const [userBounties, setUserBounties] = useState<IBounty[] | null>(null);
  const [totalBountyCount, setTotalBountyCount] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const [showMoreBtnVisible, setShowMoreBtnVisible] = useState(true);
  const [isUserProfile, setIsUserProfile] = useState(false);

  useEffect(() => {
    if(privyUser?.id === profileId){
      setIsUserProfile(true)
    } else if (user?.username === profileId) {
      setIsUserProfile(true)
    }
    return () => {
      setIsUserProfile(false)
    }
  }, [profileId, privyUser?.id])
  

  const fetchProfile = useCallback(async () => {
    if (profileId && profileId !== 'undefined') {
      setLoading(true);
      const { data, error: fetchError } = await nextApiClientFetch<IUser>(
        `api/v1/profile/${profileId}`,
        {
          usernameSource: source || null,
        }
      );
      if (fetchError || !data) {
        notification.destroy(fetchError);
        queueNotification({
          header: "Error fetching profile",
          message: fetchError,
          status: NotificationStatus.ERROR,
        });
        setLoading(false);
      } // data exists
      else {
        setProfile(data);
        setLoading(false);
      }
    }
  }, [source, profileId]);

  useEffect(() => {
    async function fetchUserBounties() {
      setBountiesLoading(true);
      const { data, error: fetchError } =
        await nextApiClientFetch<IBountyListingResponse>(
          "api/v1/listing/bounties",
          {
            page: 1,
            listingLimit: 8,
            username: [profile?.privy_user?.twitter?.username, profile?.lens_handle],
          }
        );

      if (fetchError || !data) {
        queueNotification({
          header: "Error fetching userBounties",
          message: fetchError,
          status: NotificationStatus.ERROR,
        });
        setBountiesLoading(false);
      } // data exists
      else {
        setUserBounties(data.bounties);
        setTotalBountyCount(data.totalCount);
        setBountiesLoading(false);
      }
    }

    profile && fetchUserBounties();
  }, [profile]);

  useEffect(() => {
    (async () => {
      await fetchProfile();
    })();
  }, [fetchProfile]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (divRef.current && divRef.current.scrollHeight > 300 && profile?.bio) {
        setShowMoreBtnVisible(true);
      } else {
        setShowMoreBtnVisible(false);
      }
    }, 500);
    return () => {
      clearTimeout(id);
    };
  }, [profile]);

  useEffect(() => {
		if (!isUserAuthenticated) return;
		const checkWishlist = async () => {
			const { data, error: fetchError } = await isWishlistBounty();

			if (fetchError || !data) {
				console.log("error fetching wishlist : ", fetchError);
			} // data exists
			else {
				setWishlists(data);
			}
		};

		checkWishlist();
	}, [isUserAuthenticated]);

  if (!ready || privy_loading) {
    return (
      <>
        <SEOHead
          title={"Bounty Bird | Powered By Townhall"}
          desc={
            "Link your X and Hey.xyz handles to create a profile on Bounty Bird! Connect and discover their bounty achievements. Join the community and tag @TheBountyBird to share your own bounties!"
          }
        />
        <LoadingState />
      </>
    );
  }

  const lensUrl = (handle: string) => {
    const prefix = handle.split("/")[0];
    if (prefix === "test") {
      return `https://testnet.hey.xyz/u/${handle.split("/")[1]}`;
    } else {
      return `https://hey.xyz/u/${handle.split("/")[1]}`;
    }
  };

  return (
    <>
      <SEOHead
        title={"Bounty Bird | Powered By Townhall"}
        desc={
          "Link your X and Hey.xyz handles to create a profile on Bounty Bird! Connect and discover their bounty achievements. Join the community and tag @TheBountyBird to share your own bounties!"
        }
      />
      <main className={`flex flex-col gap-5 items-center justify-center py-7`}>
        {loading ? (
          <LoadingState />
        ) : profile && profile.id ? (
          <>
            <div className="flex items-center justify-between w-full pb-5 border-b border-gray-700">
              <Link href="/" className="text-xl">
                <LeftOutlined />
                Profile
              </Link>
            </div>
            <div className="w-full rounded-xl border overflow-hidden">
              <div className="flex items-end justify-end gap-5 bg-profileHeaderGradient h-20 px-5 py-2">
                <div className="text-sm flex items-center gap-2">
                  <Image
                    src="/assets/wallet.svg"
                    alt="wallet-icon"
                    width={40}
                    height={40}
                  />
                  <div>
                    <h4 className="font-bold">$0</h4>
                    <span className="text-slate-400">$ of bounties</span>
                  </div>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <Image
                    src="/assets/bounties.svg"
                    alt="profile-icon"
                    width={40}
                    height={40}
                  />
                  <div>
                    <h4 className="font-bold">{totalBountyCount}</h4>
                    <span className="text-slate-400">No. of bounties</span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-2 flex flex-col items-start md:flex-row gap-5 bg-black">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <Image
                      src="/assets/profile-image.png"
                      alt="pfp"
                      width={150}
                      height={150}
                      className="relative mt-2 md:mt-0 md:-top-16"
                    />
                    {/* <Image
                      src="/assets/add-circle.svg"
                      alt="add"
                      width={37}
                      height={37}
                      className="absolute mt-2 right-0 bottom-16 cursor-pointer"
                    /> */}
                  </div>
                 {profile?.privy_user?.twitter?.username || profile?.privy_user?.github?.username || profile.lens_handle ?  <div className="md:mx-auto w-full bg-secondary rounded-full justify-center py-1 px-2 flex items-center gap-2 relative mt-2 md:mt-0 md:-top-16">
                    {profile?.privy_user?.twitter?.username && (
                      <Link
                        href={`https://twitter.com/${profile?.privy_user?.twitter?.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="ml-auto bg-[#181819] hover:border border-slate-700 m-[-1px] p-2 rounded-full">
                          <Image
                            src="/assets/twitterX.svg"
                            className="ml-auto  transition-all"
                            alt="brand-icon"
                            width={16}
                            height={16}
                          />
                        </button>
                      </Link>
                    )}
                    {profile?.privy_user?.github?.username && (
                      <Link
                        href={`https://github.com/${profile?.privy_user?.github?.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className=" ml-auto bg-[#181819] hover:border border-slate-700 m-[-1px] p-2 rounded-full">
                          <Image
                            src="/assets/github2.svg"
                            className="ml-auto transition-all"
                            alt="brand-icon"
                            width={16}
                            height={16}
                          />
                        </button>
                      </Link>
                    )}
                    {profile.lens_handle && (
                      <Link
                        href={lensUrl(profile.lens_handle)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="ml-auto bg-[#181819] hover:border border-slate-700 m-[-1px] p-2 rounded-full">
                          <Image
                            src="/assets/lens2.svg"
                            className="ml-auto transition-all"
                            alt="brand-icon"
                            width={16}
                            height={16}
                          />
                        </button>
                      </Link>
                    )}
                  </div> : null}
                </div>

                <div className="flex-1">
                  <div className="flex justify-center gap-2 items-baseline md:py-2">
                    <span className="font-bold text-lg md:text-2xl">
                      {profile.name || ''}
                    </span>
                    <span>@{profile.username}</span>
                    <div className="md:ml-auto flex items-center gap-2">
                      {isUserProfile &&  <Link href="/profile/update">
                        <button className="ml-auto bg-[#2F45C6] hover:border border-[#2F45f6] m-[-1px] p-2 rounded-full">
                          <Image
                            src="/assets/edit.svg"
                            className="ml-auto transition-all"
                            alt="brand-icon"
                            width={16}
                            height={16}
                          />
                        </button>
                      </Link>}
                    </div>
                  </div>
                  <div
                    ref={divRef}
                    className={`font-normal text-grey_primary leading-[23px] text-sm tracking-[0.01em] overflow-y-hidden break-words relative ${
                      showMore ? "max-h-none" : "max-h-[200px]"
                    }`}
                  >
                    <p className="my-2 text-center md:text-left">
                      {profile?.bio || "No bio available"}
                    </p>
                  </div>
                  {showMoreBtnVisible ? (
                    <div className="flex items-center justify-start  my-2">
                      <button
                        onClick={() => setShowMore(!showMore)}
                        className="border-none outline-none bg-transparent text-light_blue_primary font-medium text-blue-400 text-sm leading-[22px] flex items-center justify-center cursor-pointer"
                      >
                        {showMore ? "Show Less" : "Show More"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="w-full">
              <h2 className="font-bold text-xl">Submissions</h2>
              <div className="w-full flex flex-col items-center justify-center ">
                <Image
                  src="/assets/empty-state.svg"
                  alt="empty state"
                  width={100}
                  height={100}
                />
                <h2 className="mt-10 text-2xl font-semibold text-gray-400">
                  No Submissions Yet!
                </h2>
              </div>
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="w-full mt-10 mb-2 flex items-center justify-between">
                <h2 className="font-bold text-xl">Bounties Created</h2>
                {isUserProfile && (
                  <span className="flex gap-2 items-center">
                    <Image
                      src="/assets/file-export.svg"
                      alt="file-export-icon"
                      width={24}
                      height={24}
                    />
                    Export to CSV
                  </span>
                )}
              </div>
              {userBounties && userBounties.length > 0 ? (
                userBounties.map((bounty, i) => (
                  <BountyCard key={i} bounty={bounty} wishlists={wishlists} setWishlists={setWishlists}/>
                ))
              ) : (
                <>
                  <Image
                    src="/assets/empty-state.svg"
                    alt="empty state"
                    width={100}
                    height={100}
                  />
                  <h2 className="mt-10 text-2xl font-semibold text-gray-400">
                    Nothing to see here!
                  </h2>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <Image
              src="/assets/empty-state.svg"
              alt="empty state"
              width={150}
              height={150}
            />
            <h2 className="mt-10 text-2xl font-semibold text-gray-400">
              Profile not found!
            </h2>
          </div>
        )}
      </main>
    </>
  );
};

export default Profile;
