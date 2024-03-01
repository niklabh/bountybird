import { Inter } from "next/font/google";
import { usePrivy } from "@privy-io/react-auth";
import BountyCard from "@/src/components/ui-components/BountyCard";
import { useEffect, useState } from "react";
import nextApiClientFetch from "@/src/utils/nextApiClientFetch";
import { IBounty, IBountyListingResponse, NotificationStatus } from "@/src/types";
import { Popover } from "antd";
import { DownOutlined } from "@ant-design/icons";
import EmptyState from "@/src/components/ui-components/EmptyState";
import LoadingState from "@/src/components/ui-components/LoadingState";
import queueNotification from "@/src/components/ui-components/QueueNotification";
import SEOHead from "@/src/global/SEOHead";
import InfiniteScroll from "react-infinite-scroll-component";
import { getProfileFromId } from "@/src/api-utils/getProfileFromId";
import isWishlistBounty from "@/src/utils/isWishlistBounty";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
	const { authenticated: isUserAuthenticated, ready, user } = usePrivy();
	const [loading, setLoading] = useState<boolean>(false);
	const [bounties, setBounties] = useState<IBounty[]>([]);
	const [currPage, setCurrPage] = useState<number>(1);
	const [wishlists, setWishlists] = useState<string[]>([]);
	//Todo: use total count for pagination
	const [totalCount, setTotalCount] = useState<number>(0);
	const [filter, setFilter] = useState<string>("");
	const [hasMore, setHasMore] = useState<boolean>(true);

	async function fetchBounties() {
		setLoading(true);
		const { data, error: fetchError } = await nextApiClientFetch<IBountyListingResponse>(
			"api/v1/listing/bounties",
			{
				page: currPage,
				listingLimit: 8,
				bountyStatus: filter === "twitter" || filter === "lens" ? "" : filter,
				bountySource: filter === "twitter" || filter === "lens" ? filter : undefined,
			}
		);

		if (fetchError || !data) {
			queueNotification({
				header: "Error fetching bounties",
				message: fetchError,
				status: NotificationStatus.ERROR,
			});
			setLoading(false);
		} // data exists
		else {
			setBounties([...bounties, ...data.bounties]);
			setTotalCount(data.totalCount);
			setHasMore(data.bounties.length > 0 && bounties.length < data.totalCount);
			setCurrPage((prevPage) => prevPage + 1);
			setLoading(false);
		}
	}

	useEffect(() => {
	  if(!loading)	fetchBounties();

		return () => {
			setBounties([]);
			setCurrPage(1);
			setTotalCount(0);
			setHasMore(true);
			setLoading(false);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter]);

	const changeFilter = async (currfilter: string) => {
	if(currfilter !== filter){	
		setCurrPage(1);
		setBounties([]);
		setHasMore(true);
		setLoading(false);
		setTotalCount(0);
		setFilter(currfilter);}
	};

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
			<button
				onClick={() => changeFilter("")}
				className='text-left hover:bg-slate-600 cursor-pointer hover:text-blue-400 px-3 py-2 rounded-lg'
			>
				All Items
			</button>
			<button
				onClick={() => changeFilter("OPEN")}
				className='text-left hover:bg-slate-600 cursor-pointer hover:text-blue-400 px-3 py-2 rounded-lg'
			>
				Open
			</button>
			<button
				onClick={() => changeFilter("CLOSED")}
				className='text-left hover:bg-slate-600 cursor-pointer hover:text-blue-400 px-3 py-2 rounded-lg'
			>
				Closed
			</button>
			<button
				onClick={() => changeFilter("twitter")}
				className='text-left hover:bg-slate-600 cursor-pointer hover:text-blue-400 px-3 py-2 rounded-lg'
			>
				Twitter
			</button>
			<button
				onClick={() => changeFilter("lens")}
				className='text-left hover:bg-slate-600 cursor-pointer hover:text-blue-400 px-3 py-2 rounded-lg'
			>
				Lens
			</button>
		</div>
	);

	return (
		<>
			<SEOHead
				title={"Bounty | BountyBird by Townhall"}
				desc={
					"Use your social network to get work done! Create bounties effortlessly on Twitter or Lens Protocol by tagging @TheBountyBird bot. Join to hunt new bounties and earn rewards now!"
				}
			/>
			{ready ? (
				<main className={`flex flex-col gap-5 items-center justify-center py-7 ${inter.className}`}>
					<div className='flex items-center justify-between w-full'>
						<span className='text-xl font-bolder font-dmsams-light'>Trending Bounties</span>
						<Popover
							title=''
							trigger='hover'
							color='#243149'
							content={filterContent}
							className='p-0 m-0 flex  items-center justify-center bg-[#243149]'
							arrow={false}
							overlayInnerStyle={{ padding: "0px" }}
						>
							<p className='border whitespace-nowrap border-solid border-gray-600 px-3 rounded-lg h-8 font-semibold text-sm min-w-[90px] md:min-w-[125px] capitalize flex items-center justify-between gap-x-2 cursor-pointer'>
								{filter ? filter : "All Items"}
								<DownOutlined className='text-xs' />
							</p>
						</Popover>
					</div>
					<div className='w-full px-3'>
						{!loading && bounties.length <= 0 ? (
							<EmptyState label='No Bounties Available'>
								<p>Check back later for more opportunities.</p>
							</EmptyState>
						) : (
							<InfiniteScroll
								dataLength={bounties.length}
								next={fetchBounties}
								hasMore={hasMore}
								loader={<LoadingState />}
								endMessage={
									<div className="border-t border-[#3A3A3A]">

									<EmptyState label='No More Bounties Available'>
										<p>Check back later for more opportunities.</p>
									</EmptyState>
									</div>
								}
							>
								{bounties.map((bounty, i) => (
									<BountyCard key={i} bounty={bounty} wishlists={wishlists} setWishlists={setWishlists}/>
								))}
							</InfiniteScroll>
						)}
					</div>
				</main>
			) : (
				<LoadingState />
			)}
		</>
	);
}
