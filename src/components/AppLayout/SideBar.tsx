import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeIcon from "@/public/assets/nav-icons/home.svg";
import HeartIcon from "@/public/assets/nav-icons/heart.svg";
import UserIcon from "@/public/assets/nav-icons/user.svg";
import DocsIcon from "@/public/assets/nav-icons/docs.svg";
import BirdImg from "@/public/assets/bounty-bird-mobile.png";
import QuestionIcon from "@/public/assets/nav-icons/question.svg";
import { CloseOutlined } from "@ant-design/icons";
import useMediaQuery from "@/src/hooks/useMediaQuery";
import { Popover } from "antd";
import { useProfileSelector } from "@/src/redux/selectors";

interface ISideBarProps {
	isSideBarOpen: boolean;
	setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar = ({ isSideBarOpen, setIsSideBarOpen }: ISideBarProps) => {
	const isMobile = useMediaQuery("(max-width: 640px)");
	const { user } = useProfileSelector();
	const [popoverOpen, setPopoverOpen] = useState(true);

	useEffect(() => {
		const popoverTimeout = setTimeout(() => {
			setPopoverOpen(false);
		}, 3000);

		return () => {
			clearTimeout(popoverTimeout);
		};
	}, []);

	const menuItems = [
		{ icon: HomeIcon, text: "Feed", path: "/" },
		{ icon: HeartIcon, text: "Wishlist", path: "/wishlist" },
		{
			icon: UserIcon,
			text: "My Profile",
			path: `/profile/${user?.username ? user?.username : user?.privy_user?.wallet?.address}`,
		},
		{
			icon: DocsIcon,
			text: "Documentation",
			path: "https://bounty-bird.gitbook.io/bounty-bird/",
			blank: true,
		},
		{
			icon: QuestionIcon,
			text: "Dispute Resolution",
			path: "/support",
		},
	];

	const helloContent = (
		<div>
			<button
				className='font-semibold absolute right-0 top-0 m-3'
				onClick={() => setPopoverOpen(false)}
			>
				<CloseOutlined />
			</button>
			<p className='font-semibold'>Not sure how to hunt a bounty?</p>
			<a
				href='https://bounty-bird.gitbook.io/bounty-bird/hunt-a-bounty'
				target='_blank'
				rel='noreferrer'
			>
				<p className='font-semibold underline'>Check Here</p>
			</a>
		</div>
	);

	const handleOpenChange = (newOpen: boolean) => {
		setPopoverOpen(newOpen);
	};
	return (
		<>
			{isMobile ? (
				<div
					className={`fixed z-10 top-0 left-0 h-screen w-3/5 ${
						isSideBarOpen ? "flex" : "hidden"
					} flex flex-col pt-20 bg-black md:bg-transparent shadow-lg border-r border-solid border-[#434343]`}
				>
					{menuItems.map((item) => (
						<SideBarItemMobile
							key={item.text}
							icon={item.icon}
							text={item.text}
							path={item.path}
							blank={item.blank}
							onClick={() => setIsSideBarOpen(false)}
						/>
					))}
					<Popover
						color={"#ffeeee"}
						placement='right'
						open={popoverOpen}
						onOpenChange={handleOpenChange}
						content={helloContent}
						trigger='click'
						title='Welcome!!'
					>
						<Image
							src={BirdImg}
							className='mx-auto cursor-pointer transition-all'
							alt='brand-icon'
							width={46}
							height={46}
						/>
					</Popover>
					<div className='flex sm:hidden gap-4 items-center mx-auto mt-8'>
						<Link
							href='https://x.com/thebountybird?s=21&t=3qgD8lI9c9ta7cUXv0bn-g'
							target='_blank'
							rel='noreferrer'
						>
							<button className='ml-auto bg-[#172261] p-2 hover:border border-[#172291]  m-[-1px] rounded-full'>
								<Image
									src='/assets/twitterX.svg'
									className='ml-auto cursor-pointer hover: transition-all'
									alt='brand-icon'
									width={16}
									height={16}
								/>
							</button>
						</Link>
						<Link href='https://t.me/BountyBird' target='_blank' rel='noreferrer'>
							<button className='ml-auto bg-[#172261] hover:border border-[#172291] m-[-1px] p-2 rounded-full'>
								<Image
									src='/assets/telegram.svg'
									className='ml-auto cursor-pointer  transition-all'
									alt='brand-icon'
									width={16}
									height={16}
								/>
							</button>
						</Link>
						<Link href='https://discord.gg/q4CgwD4S4s' target='_blank' rel='noreferrer'>
							<button className='ml-auto bg-[#172261] hover:border border-[#172291] m-[-1px] p-2 rounded-full'>
								<Image
									src='/assets/discord.svg'
									className='ml-auto cursor-pointer  transition-all'
									alt='brand-icon'
									width={16}
									height={16}
								/>
							</button>
						</Link>
					</div>
				</div>
			) : (
				<div className='fixed top-0 left-0 h-screen w-20 hidden md:flex flex-col bg-black md:bg-transparent shadow-lg border-r border-solid border-[#434343]'>
					<div className='logo flex items-center justify-center mt-5 mb-10'>
						<Link href='/'>
							<Image src='/assets/logo.svg' alt='logo' width={35} height={44} />
						</Link>
					</div>
					{menuItems.map((item) => (
						<SideBarItem
							key={item.text}
							icon={item.icon}
							text={item.text}
							path={item.path}
							blank={item.blank}
						/>
					))}
					<Popover
						color={"#ffeeee"}
						placement='right'
						content={helloContent}
						open={popoverOpen}
						onOpenChange={handleOpenChange}
						// trigger='click'
						title='Welcome!!'
						defaultOpen={true}
					>
						<div className="mx-auto bg-secondary  rounded-full w-10 h-10 flex justify-center items-center">
							<Image
								src={BirdImg}
								className=' cursor-pointer transition-all'
								alt='brand-icon'
								width={30}
								height={30}
							/>
						</div>
					</Popover>
				</div>
			)}
		</>
	);
};

const SideBarItem = ({
	icon: Icon,
	text = "tooltip 💡",
	path,
	blank,
}: {
	icon: any;
	text?: string;
	path: string;
	blank?: boolean;
}) => {
	const currentPath = usePathname();

	return (
		<Link
			href={path}
			target={`${blank ? "_blank" : ""}`}
			rel={`${blank ? "nofollow noreferrer" : ""}`}
			className={`relative flex items-center justify-center h-16 w-full mx-auto bg-[auto_100%] bg-no-repeat hover:text-white transition-all duration-200 ease-linear cursor-pointer group ${
				currentPath === path
					? "h-24 bg-[url(/assets/nav-icons/bg-menu-item.svg)]"
					: "hover:w-12 hover:rounded-full hover:bg-purple hover:h-12 mb-2"
			}`}
		>
			<span className='w-10 aspect-square rounded-full flex items-center justify-center bg-secondary z-10'>
				<Icon className={`${currentPath === path ? "fill-white" : ""}`} />
			</span>
			<span className=' absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-white bg-gray-900 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100'>
				{text}
			</span>
		</Link>
	);
};

const SideBarItemMobile = ({
	icon: Icon,
	text = "tooltip 💡",
	path,
	blank,
	onClick,
}: {
	icon: any;
	text?: string;
	path: string;
	blank?: boolean;
	onClick: () => void;
}) => {
	const currentPath = usePathname();

	return (
		<Link
			href={path}
			target={`${blank ? "_blank" : ""}`}
			rel={`${blank ? "nofollow noreferrer" : ""}`}
			onClick={onClick}
			className={`relative flex items-center gap-3 h-fit p-1 pl-5 my-3 w-4/5 rounded-r-xl bg-no-repeat hover:text-white transition-all duration-100 ease-linear cursor-pointer ${
				currentPath === path ? "bg-purple" : "hover:bg-darkBlue"
			}`}
		>
			<span className='w-7 aspect-square rounded-full flex items-center justify-center z-10'>
				<Icon className={`${currentPath === path ? "fill-white" : ""}`} />
			</span>
			<span className='text-white text-xs font-bold'>{text}</span>
		</Link>
	);
};

export default SideBar;
