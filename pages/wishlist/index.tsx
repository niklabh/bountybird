import { Inter } from "next/font/google";
import { usePrivy } from "@privy-io/react-auth";
import BountyCard from "@/src/components/ui-components/BountyCard";
import { useEffect, useState } from "react";
import nextApiClientFetch from "@/src/utils/nextApiClientFetch";
import {
  IBounty,
  IBountyListingResponse,
  NotificationStatus,
} from "@/src/types";
import { Popover } from "antd";
import { DownOutlined } from "@ant-design/icons";
import EmptyState from "@/src/components/ui-components/EmptyState";
import LoadingState from "@/src/components/ui-components/LoadingState";
import Link from "next/link";
import Image from "next/image";
import queueNotification from "@/src/components/ui-components/QueueNotification";
import SEOHead from "@/src/global/SEOHead";
import isWishlistBounty from "@/src/utils/isWishlistBounty";

const inter = Inter({ subsets: ["latin"] });

const Wishlist = () => {
  const { ready, authenticated: isUserAuthenticated, login } = usePrivy();
  const [bounties, setBounties] = useState<IBounty[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
	const [wishlists, setWishlists] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    async function fetchBounties() {
      setLoading(true);

      const { data, error: fetchError } =
        await nextApiClientFetch<IBountyListingResponse>(
          "api/v1/auth/data/wishlist"
        );

      if (fetchError || !data) {
        setLoading(false);
      } // data exists
      else {
        setBounties(data.bounties);
        setTotalCount(data.totalCount);
        setLoading(false);
      }
    }

    fetchBounties();
  }, [filter]);

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

  const filterContent = (
		<div className='flex flex-col text-white w-32'>
			<button onClick={()=> setFilter('')} className="text-left hover:bg-slate-600 cursor-pointer hover:text-blue-400 px-3 py-2 rounded-lg">All Items</button>
			<button onClick={()=> setFilter('OPEN')} className="text-left hover:bg-slate-600 cursor-pointer hover:text-blue-400 px-3 py-2 rounded-lg">Open</button>
			<button onClick={()=> setFilter('CLOSED')} className="text-left hover:bg-slate-600 cursor-pointer hover:text-blue-400 px-3 py-2 rounded-lg">Closed</button>
		</div>
	);

  return (
    <>
      <SEOHead
				title={'Bounty Wishlist | Bounty Bird by Townhall'}
				desc={'Check the Wishlist feature on Bounty Bird - Your hub for tracking and sharing your Web3 bounties. Keep your goals in sight and turn them into reality with @TheBountyBird. Lets get hunting!.'}
			/>
      {
        ready?
          isUserAuthenticated?
            <main
              className={`flex flex-col gap-5 items-center justify-center py-7 ${inter.className}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xl">Saved Bounties</span>
                <Popover
                title=''
                trigger='hover'
                color='#243149'
                  content={ filterContent }
                  className='p-0 m-0 flex  items-center justify-center bg-[#243149]'
                  arrow={false}
                      overlayInnerStyle={{padding: '0px'}}
                
                >
                  <p className='border whitespace-nowrap border-solid border-gray-600 px-3 rounded-lg h-8 font-semibold text-sm min-w-[90px] md:min-w-[125px] capitalize flex items-center justify-between gap-x-2 cursor-pointer'>
                    {filter ? filter : "All Items"}
                    <DownOutlined className='text-xs' />
                  </p>
                </Popover>
              </div>
              <div className="w-full">
                {loading ? (
                  <LoadingState />
                ) : bounties && bounties.length > 0 ? (
                  bounties.map((bounty, i) => <BountyCard key={i} bounty={bounty} wishlists={wishlists} setWishlists={setWishlists}/>)
                ) : (
                  <EmptyState label="No saved bounties here!">
                    <p>Check out the feed and save some bounties</p>
                    <Link
                      href="/"
                      className="mx-auto bg-purple text-white rounded-3xl px-4 py-1"
                    >
                      Explore Bounties
                    </Link>
                  </EmptyState>
                )}
              </div>
            </main>
          : (
            <div className="flex flex-col gap-5 items-center justify-center w-full h-lvh">
              <Image
                src="/assets/pls-login.svg"
                alt="pls login"
                width={200}
                height={200}
              />
              <p className="text-3xl">Login to view wishlist</p>
              <button
                onClick={login}
                className="mx-auto bg-purple text-white rounded-3xl px-4 py-1"
              >
                Login
              </button>
            </div>
          )
          : <LoadingState />
      }
    </>
  );
};

export default Wishlist;
