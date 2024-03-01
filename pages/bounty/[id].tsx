import { IBounty, IBountyReply, NotificationStatus } from "@/src/types";
import Link from "next/link";
import { useState, useEffect, SetStateAction } from "react";
import { LeftOutlined } from "@ant-design/icons";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import PostReply from "@/src/components/ui-components/PostReply";
import LoadingState from "@/src/components/ui-components/LoadingState";
import EmptyState from "@/src/components/ui-components/EmptyState";
import { getProfileFromId } from "@/src/api-utils/getProfileFromId";
import { getBountyById } from "@/src/api-utils/getBountyById";
import BountyCard from "@/src/components/ui-components/BountyCard";
import ReviewSubmission from "@/src/components/ui-components/ReviewSubmissions";
import convertJsonToCsv from "@/src/utils/jsonToCsv";
import SEOHead from "@/src/global/SEOHead";
import { useAccount, useDisconnect } from "wagmi";
import ConnectLensModal from "@/src/components/ConnectLensModal";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import queueNotification from "@/src/components/ui-components/QueueNotification";
import isWishlistBounty from "@/src/utils/isWishlistBounty";

const BountyPost = () => {
	const router = useRouter();
	const { id: bountyId } = router.query;
	const [wishlists, setWishlists] = useState<string[]>([]);
	const { ready, authenticated: isUserAuthenticated, user, logout, linkTwitter } = usePrivy();
	const [loading, setLoading] = useState<boolean>(false);
	const [isBountyOwner, setIsBountyOwner] = useState<boolean>(false);
	const { address, isConnected } = useAccount();
	const [view, setView] = useState<string>("replies");
	const [connectLensOpen, setConnectLensOpen] = useState(false);
	const { disconnect } = useDisconnect();
	const [bounty, setBounty] = useState<IBounty | null>(null);
	const { open } = useWeb3Modal();

	const toggleView = (view: SetStateAction<string>) => {
		setView(view);
	};

	async function fetchBountyById() {
		setLoading(true);
		const { data, error: fetchError } = await getBountyById(bountyId);
		if (fetchError || !data) {
			console.log("fetchError : ", fetchError);
			setLoading(false);
		} // data exists
		else {
			setBounty(data);
			setLoading(false);
		}
	}

	useEffect(() => {
		if (bountyId) fetchBountyById();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bountyId]);

	useEffect(() => {
		async function fetchProfile() {
			const { data, error: fetchError } = await getProfileFromId(user?.id);
			if (data) {
				setIsBountyOwner(
					user?.twitter?.username === bounty?.username || data.lens_handle === bounty?.username
				);
			}
		}
		fetchProfile();
	}, [user, bounty]);

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

	const handleExport = (replies: IBountyReply[] | undefined) => {
		if (replies) convertJsonToCsv(replies, "submission_data");
		else console.log("Cannot export submissions");
	};

	const linkLens = () => {
		if (isConnected && address) {
			setConnectLensOpen(true);
		} else {
			disconnect();
			open({ view: "Connect" });
		}
	};

	const linkTwitterHandler = async () => {
		if (isUserAuthenticated) {
			try {
				await linkTwitter();
			} catch (e) {
				queueNotification({
					header: e.message || "Something went wrong",
					status: NotificationStatus.ERROR,
				});
			}
		}
	};

	return (
		<>
			<SEOHead
				title={"Bounty | BountyBird by Townhall"}
				desc={
					bounty?.source_text ||
					":star2: Explore this exciting bounty on Bounty Bird! Join the hunt and earn rewards with just a tag. Create bounties effortlessly on Twitter and Lens Protocol by tagging @TheBountyBird. Your gateway to Web3 rewards!"
				}
			/>
			{ready ? (
				<main className={`flex flex-col gap-5  items-center justify-center pt-7 mb-4`}>
					<div className='flex items-center justify-between w-full pb-5'>
						<Link href='/' className='text-xl'>
							<LeftOutlined width={18} height={18} className='mr-1' />
							Bounty on BountyBird
						</Link>
					</div>
					{loading ? (
						<LoadingState />
					) : bounty ? (
						<>
							{!isBountyOwner && (
								<span className='w-full text-left -mb-3 text-cs text-gray-300'>
									<span className='text-[darkred] font-6xl pr-1'>*</span>If you&apos;re the bounty
									owner,{" "}
									<span className='text-[#2F45C6] cursor-pointer' onClick={logout}>
										login with a different wallet
									</span>{" "}
									or{" "}
									{bounty.source === "twitter" ? (
										<span className='text-[#578CF0] cursor-pointer ' onClick={linkTwitterHandler}>
											connect your X
										</span>
									) : (
										<span className='text-[#c86274] cursor-pointer' onClick={linkLens}>
											connect your Hey
										</span>
									)}{" "}
									account to review submissions and pay out rewards.
								</span>
							)}
							<BountyCard bounty={bounty} fetchBountyById={fetchBountyById} wishlists={wishlists} setWishlists={setWishlists}/>
							<div className='w-full mb-2 flex gap-4 items-center justify-between border-t border-[#3A3A3A] pt-4'>
								<div className='flex gap-4 justify-between items-center'>
									<h2
										onClick={() => toggleView("replies")}
										className={`cursor-pointer font-bold text-xl ${
											view === "replies" && "border-b-2 border-[#2F45C6]"
										}`}
									>
										Direct Replies
									</h2>
									<span
										className={`flex gap-2 items-center ${
											view !== "replies" && "border-b-2 border-[#2F45C6]"
										} font-helvetica-bold text-xl  cursor-pointer`}
										onClick={() => toggleView("submissions")}
									>
										Submissions
									</span>
								</div>
								{bounty && bounty.replies && bounty.replies?.length > 0 && (
									<span
										className='flex gap-2 items-center cursor-pointer'
										onClick={() => handleExport(bounty.replies)}
									>
										<Image
											src='/assets/file-export.svg'
											alt='file-export-icon'
											width={20}
											height={20}
										/>
										Export to CSV
									</span>
								)}
							</div>
							{view === "replies" && (
								<div className='w-full'>
									{bounty.replies && bounty.replies?.length > 0 ? (
										bounty.replies.map((reply) => (
											<PostReply
												key={reply.id}
												reply={reply}
												bountyId={bounty.id}
												amount={bounty.amount}
												isBountyOwner={isBountyOwner}
											/>
										))
									) : (
										<EmptyState label='No replies on this post yet' />
									)}
								</div>
							)}
							{view === "submissions" && (
								<div className='my-5 w-full'>
									{bounty.replies && bounty.replies.length > 0 ? (
										<ReviewSubmission
											bounty={bounty}
											setBounty={setBounty}
											isBountyOwner={isBountyOwner}
										/>
									) : (
										<EmptyState label='No submissions on this post yet' />
									)}
								</div>
							)}
						</>
					) : (
						<h1 className='text-2xl font-semibold'>POST NOT FOUND</h1>
					)}
				</main>
			) : (
				<LoadingState />
			)}
			<ConnectLensModal
				modalOpen={connectLensOpen}
				setModalOpen={setConnectLensOpen}
				address={address}
			/>
		</>
	);
};

export default BountyPost;
