import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { EReactionEmoji, IBounty, NotificationStatus } from "@/src/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { LinkOutlined } from "@ant-design/icons";
import { dayjs } from "@/src/dayjs-init";
import addBountyToWishlist from "@/src/utils/addBountyToWishLis";
import removeFromWishlist from "@/src/utils/removeFromWishlist";
import isWishlistBounty from "@/src/utils/isWishlistBounty";
import LikeIcon from "@/public/assets/heart-icon.svg";
import LikeFillIcon from "@/public/assets/likeFill.svg";
import MessageIcon from "@/public/assets/message-icon.svg";
import RetweetIcon from "@/public/assets/retweet-icon.svg";
import ReactHTMLParser from "react-html-parser";
import ShareIcon from "@/public/assets/share-icon.svg";
import WishlistEmptyIcon from "@/public/assets/wishlistEmpty.svg";
import WishlistIcon from "@/public/assets/wishlist.svg";
import SendIcon from "@/public/assets/rightArrow.svg";
import queueNotification from "./QueueNotification";
import { dislikeBounty, likeBounty } from "@/src/api-utils/likeDislikeBounty";
import { Input, Popover } from "antd";
import { getProfileFromId } from "@/src/api-utils/getProfileFromId";
import EditBountyModal from "../EditBountyModal";
import { addComment } from "@/src/utils/commentsActions";
import { getTwitterHref } from "../../utils/tweetCta";
import LoginModal from "../LoginModal";
import { useProfileSelector } from "@/src/redux/selectors";

const BountyCard = ({
	bounty,
	wishlists,
	setWishlists,
	fetchBountyById,
}: {
	bounty: IBounty;
	fetchBountyById?: () => void;
	wishlists: string[];
	setWishlists: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
	const router = useRouter();
	// const [wishlists, setWishlists] = useState<string[]>([]);
	const [isBountyOwner, setIsBountyOwner] = useState<boolean>(false);
	const [currentBounty, setCurrentBounty] = useState(bounty);
	const [editBountyOpen, setEditBountyOpen] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);
	const [comment, setComment] = useState("");
	const [loadingComment, setLoadingComment] = useState(false);
	const { user: selectorUser } = useProfileSelector();
	const currentPath = usePathname();

	const { authenticated: isUserAuthenticated, user } = usePrivy();

	const isBountyOwnerProfile =
		currentPath === `/profile/${user?.id}` && user?.twitter?.username === bounty.username;

	const isBountyPage = currentPath.includes("bounty");

	const addToWishlist = async (e: { stopPropagation: () => void }) => {
		e.stopPropagation();
		if (isUserAuthenticated) {
			setWishlists([...wishlists, bounty.id]);
			const { data, error: fetchError } = await addBountyToWishlist(bounty.id);
			if (fetchError || !data) {
				// setIsWishlisted(false);
				setWishlists(wishlists.filter((w) => w !== bounty.id));
				queueNotification({
					header: "Something went wrong",
					status: NotificationStatus.ERROR,
				});
			} else {
				queueNotification({
					header: "Bounty added to wishlist",
					message: "You can view your wishlist in your profile",
					status: NotificationStatus.SUCCESS,
				});
			}
		} else {
			setLoginOpen(true);
		}
	};

	const removeWishlist = async (e: { stopPropagation: () => void }) => {
		e.stopPropagation();
		if (isUserAuthenticated) {
			setWishlists(wishlists.filter((w) => w !== bounty.id));
			const { data, error: fetchError } = await removeFromWishlist(bounty.id);
			if (fetchError || !data) {
				setWishlists([...wishlists, bounty.id]);
				queueNotification({
					header: "Something went wrong",
					status: NotificationStatus.ERROR,
				});
			} else {
				queueNotification({
					header: "Bounty removed from wishlist",
					status: NotificationStatus.SUCCESS,
				});
			}
		} else {
			setLoginOpen(true);
		}
	};

	const addBountyComment = async (id: string, text: string) => {
		if (isUserAuthenticated) {
			setLoadingComment(true);
			const { data, error: fetchError } = await addComment(id, text);
			if (fetchError || !data) {
				setLoadingComment(false);
				queueNotification({
					header: "Something went wrong",
					status: NotificationStatus.ERROR,
				});
			} else {
				queueNotification({
					header: "Success",
					message: "Comment added",
					status: NotificationStatus.SUCCESS,
				});

				if (fetchBountyById) {
					fetchBountyById();
				}
				if (currentBounty && currentBounty.replies_count) {
					const newCount = currentBounty.replies_count + 1;
					setCurrentBounty({ ...currentBounty, replies_count: newCount });
				}
				setComment("");
				setLoadingComment(false);
			}
		} else {
			setLoginOpen(true);
		}
	};

	const openEditBountyModal = (e: { stopPropagation: () => void }) => {
		e.stopPropagation();
		setEditBountyOpen(true);
	};

	const bountyHunt = async () => {
		if (isUserAuthenticated) {
			router.push(`/bounty/${currentBounty.id}`);
		} else {
			setLoginOpen(true);
		}
	};

	const handleLikeDislike = async () => {
		if (isUserAuthenticated) {
			if (currentBounty && currentBounty?.reactions && user) {
				const isUserReacted = currentBounty?.reactions.some(
					(reaction) => reaction.user_id === user.id
				);
				if (isUserReacted) {
					const tempReactions = currentBounty.reactions;
					if (tempReactions) {
						const reactionsToKeep = tempReactions.filter((entry) => !(entry.user_id === user.id));
						setCurrentBounty({ ...bounty, reactions: reactionsToKeep });
					}
					const { data, error: fetchError } = await dislikeBounty(bounty.id);

					if (fetchError || !data) {
						setCurrentBounty({ ...bounty, reactions: bounty.reactions });
						queueNotification({
							header: "Error",
							message: "Something went wrong",
							status: NotificationStatus.ERROR,
						});
					}
				} else {
					const newReaction = {
						reaction: EReactionEmoji.THUMBS_UP,
						user_id: user.id,
						created_at: new Date(),
					};
					setCurrentBounty({
						...bounty,
						reactions: [...currentBounty.reactions, newReaction],
					});
					const { data, error: fetchError } = await likeBounty(bounty.id);

					if (fetchError || !data) {
						setCurrentBounty({ ...bounty, reactions: bounty.reactions });
						queueNotification({
							header: "Error",
							message: "Something went wrong",
							status: NotificationStatus.ERROR,
						});
					}
				}
			}
		} else {
			setLoginOpen(true);
		}
	};

	const openProfile = () => {
		// router.push(`/profile/${bounty.username}`);
		if (bounty.source === "twitter") {
			// window.open(`https://twitter.com/${bounty.username}`, "_blank");
			router.push(`/profile/${bounty.username}?source=twitter`);
		} else if (bounty.source === "lens") {
			// window.open(`https://twitter.com/${bounty.username}`, "_blank");
			router.push(`/profile/${bounty.username.split("/")[1]}?source=lens`);
		} else {
			const prefix = bounty.username.split("/")[0];
			if (prefix === "test") {
				window.open(`https://testnet.hey.xyz/u/${bounty.username.split("/")[1]}`, "_blank");
			} else {
				window.open(`https://hey.xyz/u/${bounty.username.split("/")[1]}`, "_blank");
			}
		}
	};

	const engageBounty = () => {
		if (bounty.source === "twitter") {
			window.open(`https://twitter.com/${bounty.username}/status/${bounty.source_id}`, "_blank");
		} else {
			const prefix = bounty.username.split("/")[0];
			if (prefix === "test") {
				window.open(`https://testnet.hey.xyz/posts/${bounty.source_id}/`, "_blank");
			} else {
				window.open(`https://hey.xyz/posts/${bounty.source_id}/`, "_blank");
			}
		}
	};

	useEffect(() => {
		if (selectorUser) {
			setIsBountyOwner(
				user?.twitter?.username === bounty?.username || selectorUser.lens_handle === bounty?.username
			);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectorUser, bounty]);

	const onCopyShare = () => {
		navigator.clipboard.writeText(`https://www.bountybird.xyz/bounty/${currentBounty.id}`);
		queueNotification({
			header: "Success",
			message: "Link copied to clipboard",
			status: NotificationStatus.SUCCESS,
		});
	};

	const shareContent = (
		<div className='min-w-[110px] text-white'>
			<a
				href={getTwitterHref({
					title: "Checkout this bounty",
					tags: ["bounty", "bountybird"],
					url: `https://www.bountybird.xyz/bounty/${currentBounty.id}`,
				})}
				target='_blank'
				rel='noreferrer'
			>
				<button className='text-md font-semibold  flex justify-between items-center w-full py-1'>
					<h3>Share on X</h3>
					<Image src='/assets/twitterX.svg' alt='x-icon' width={16} height={16} />
				</button>
			</a>
			<a
				href={`https://hey.xyz/?text=${
					"Checkout this bounty: " + currentBounty.task + "via @thebountybird"
				}`}
				target='_blank'
				rel='noreferrer'
			>
				<button className='text-md font-semibold  flex justify-between items-center w-full py-1'>
					<h3 className='hover:text-[#578CF0]'>Share on Hey</h3>
					<Image src='/assets/lens2.svg' alt='lesn-icon' width={20} height={20} />
				</button>
			</a>
			<button
				onClick={onCopyShare}
				className='text-md font-semibold flex items-center justify-between py-1 w-full'
			>
				<h3 className='hover:text-[#578CF0]'>Copy Link </h3> <LinkOutlined />
			</button>
		</div>
	);

	return (
		<div className='w-full py-6 border-t border-[#3A3A3A]'>
			<div className='flex gap-2 items-baseline'>
				<h2 className='md:text-2xl font-helvetica-md font-light'>{currentBounty.amount}</h2>
				<span className='text-xs md:text-sm'>Max {currentBounty.max_claims} claims</span>
				<div className='ml-auto flex items-center text-xs md:text-sm gap-2'>
					{isBountyOwnerProfile ? (
						<span>Not funded</span>
					) : (
						<span className='text=[#B7BCC7] '>
							Due{" "}
							{dayjs(currentBounty.deadline).isBefore(dayjs().subtract(1, "w"))
								? dayjs(currentBounty.deadline).format("DD-MM-YY")
								: dayjs(currentBounty.deadline).startOf("day").fromNow()}
						</span>
					)}
					<span className='w-1 aspect-square bg-white rounded-full'></span>
					<span
						className={`text-white border font-semibold px-3 py-1 rounded-2xl ${
							currentBounty.status === "OPEN"
								? " border-[#29CC7A] bg-[#105231]"
								: " border-[#29CC7A] border-orangeRed bg-[#591A00]"
						}`}
					>
						{currentBounty.status}
					</span>
				</div>
			</div>

			<div className='flex items-center gap-2 my-2'>
				<Image
					src='/assets/pfp.svg'
					alt='profile-icon'
					width={24}
					height={24}
					onClick={openProfile}
				/>
				<div className='flex flex-col text-sm ml-1 md:gap-2 md:text-lg md:flex-row'>
					<span
						className={`font-semibold text-sm ${
							currentBounty.source === "twitter" ? "text-[#578CF0]" : "text-[#c86274]"
						} cursor-pointer`}
						onClick={openProfile}
					>
						{currentBounty.display_name}
					</span>
					<span
						className={`font-semibold  text-sm ${
							currentBounty.source === "twitter" ? "text-[#2F6DA6]" : "text-[#824852]"
						} cursor-pointer`}
						onClick={openProfile}
					>
						@{currentBounty.username}
					</span>
				</div>
			</div>
			<div
				className={`rounded-3xl border my-2 overflow-hidden ${
					bounty.source === "twitter" ? "border-[#2F6DA6]" : "border-[#824852]"
				}`}
			>
				<div
					className={`flex gap-1 items-center p-2 px-4 border-b  ${
						currentBounty.source === "twitter"
							? "border-[#2F6DA6] bg-fadedBlue"
							: "border-[#824852] bg-fadedBrown"
					}`}
				>
					<div className='flex w-11/12 flex-col text-sm ml-1 md:gap-2 md:text-lg md:flex-row'>
						<span
							className={`font-semibold w-full cursor-pointer truncate text-ellipsis overflow-hidden text-white`}
						>
							{currentBounty.task}
						</span>
					</div>
					<div onClick={engageBounty} className='ml-auto cursor-pointer'>
						<Image
							src={`${
								currentBounty.source === "twitter" ? "/assets/twitter.svg" : "/assets/lens-icon.svg"
							}`}
							className='ml-auto cursor-pointer hover:w-[26px] transition-all'
							alt='brand-icon'
							width={24}
							height={24}
						/>
					</div>
				</div>
				<div
					className={`p-4 bg-black relative ${!isBountyPage && "cursor-pointer"}`}
					onClick={() => bountyHunt()}
				>
					<p className='text-sm mb-3 leading-6'>
						{ReactHTMLParser(currentBounty?.source_text || "")}
					</p>

					{/* <p className='text-sm mb-3 leading-6'>{currentBounty.task}</p>
					<p className='text-sm mb-3'>Amount: {currentBounty.amount}</p>
					<p className='text-sm mb-3'>Claims: {currentBounty.claims.length}</p> */}

					<p className='text-sm mb-3'>@thebountybird</p>
					{isBountyOwner && (
						<button
							title='Edit'
							className='absolute bottom-0 right-0 ml-auto bg-[#2F45C6] hover:border border-[#2F45f6] m-2 p-2 rounded-full'
							onClick={(e) => openEditBountyModal(e)}
						>
							<Image
								src='/assets/edit.svg'
								className='ml-auto transition-all'
								alt='brand-icon'
								width={16}
								height={16}
							/>
						</button>
					)}
				</div>
			</div>
			<div className='flex mt-3 '>
				<div className='flex items-center gap-2 md:gap-5'>
					<span
						className='flex gap-1 items-center cursor-pointer leading-none'
						onClick={handleLikeDislike}
					>
						{currentBounty &&
						user &&
						currentBounty.reactions &&
						currentBounty?.reactions.some((reaction) => reaction.user_id === user.id) ? (
							<LikeFillIcon />
						) : (
							<LikeIcon />
						)}
						<span className='text-xs md:text-sm'>{currentBounty.reactions?.length}</span>
					</span>
					<span
						className='flex gap-1 items-center cursor-pointer leading-none'
						onClick={() => bountyHunt()}
					>
						<MessageIcon />
						<span className='text-xs md:text-sm'>
							{"replies_count" in currentBounty
								? currentBounty.replies_count
								: currentBounty.replies?.length}
						</span>
					</span>
					{/* <span onClick={engageBounty}>
						<RetweetIcon />
					</span> */}
					<Popover color='#243149' placement='topLeft' content={shareContent}>
						<ShareIcon className='cursor-pointer' />
					</Popover>
				</div>
				{!isBountyPage && (
					<>
						{isBountyOwnerProfile ? (
							<span
								onClick={() => bountyHunt()}
								className='bg-purple text-white rounded-3xl px-4 py-1'
							>
								Fund
							</span>
						) : (
							<>
								{bounty.status === "OPEN" ? (
									<div className='flex ml-auto items-center gap-2 text-xs md:text-sm'>
										{wishlists.includes(currentBounty.id) ? (
											<WishlistIcon
												className='cursor-pointer'
												//Todo: remove wishlist on click
												onClick={(e: { stopPropagation: () => void }) => removeWishlist(e)}
											/>
										) : (
											<WishlistEmptyIcon
												className='cursor-pointer'
												onClick={(e: { stopPropagation: () => void }) => addToWishlist(e)}
											/>
										)}
										<button
											onClick={() => bountyHunt()}
											className='bg-purple font-helvetica-md text-white hover:bg-[#3651f3] border border-purple  hover:border-white rounded-xl px-3 md:px-5 py-1'
										>
											Hunt
										</button>
									</div>
								) : (
									<div className='flex ml-auto items-center gap-2 text-xs md:text-sm'>
										<button
											className='bg-purple font-helvetica-md text-white hover:bg-[#3651f3] hover:border m-[-1px] border-white rounded-3xl px-3 md:px-5 py-1'
											onClick={() => bountyHunt()}
										>
											View
										</button>
									</div>
								)}
							</>
						)}
					</>
				)}
			</div>
			<div className='mt-4 flex flex-col items-end '>
				{/* <div className='flex w-full items-start gap-2 my-1'>
							<Image
								src='/assets/pfp.svg'
								alt='profile-icon'
								width={24}
								height={24}
								onClick={openProfile}
							/>
							<div className='bg-slate-800 p-2 w-full rounded-lg'>
								<p className='text-xs text-gray-400'>Username</p>
								<h3 className='text-sm text-gray-400'>Test comment </h3>
							</div>
						</div>
						<span className='text-xs text-gray-600 cursor-pointer mt-3'>Show more comments</span> */}

				<div className=' flex w-full bg-slate-900 p-1 px-3 mt-2 placeholder-slate-500 border-black text-white rounded-xl'>
					<Image
						src='/assets/pfp.svg'
						alt='profile-icon'
						width={24}
						height={24}
						onClick={openProfile}
					/>

					<Input
						type='text'
						disabled={bounty.status === "CLOSED"}
						placeholder='Make a submission'
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						onPressEnter={(e) => {
							if (e.key === "Enter") {
								addBountyComment(currentBounty.id, comment);
							}
						}}
						className='w-full bg-transparent placeholder-slate-500 border-none focus:bg-transparent hover:bg-transparent text-white rounded-full mx-1'
					/>
					<button
						disabled={!comment || loadingComment}
						className='disabled:cursor-not-allowed text-sm font-dmsans-md text-gray-400'
						onClick={() => addBountyComment(currentBounty.id, comment)}
					>
						{loadingComment ? "Sending" : <SendIcon className='w-8' />}{" "}
					</button>
				</div>
			</div>
			{bounty && (
				<EditBountyModal
					bounty={bounty}
					setBounty={setCurrentBounty}
					setModalOpen={setEditBountyOpen}
					modalOpen={editBountyOpen}
				/>
			)}
			<LoginModal setModalOpen={setLoginOpen} modalOpen={loginOpen} />
		</div>
	);
};

export default BountyCard;
