import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";

import useMediaQuery from "@/src/hooks/useMediaQuery";
import Auth from "./Auth";

interface IHeaderProps {
	isSideBarOpen: boolean;
	setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ isSideBarOpen, setIsSideBarOpen }: IHeaderProps) => {
	const isMobile = useMediaQuery("(max-width: 640px)");

	return (
		<div className='sticky z-20 w-full flex items-center justify-between py-2 px-5 xl:px-0 text-white'>
			{isMobile ? (
				<div className=' flex items-center gap-5'>
					{isSideBarOpen ? (
						<span className='fixed sm:relative' onClick={() => setIsSideBarOpen(false)}>
							<CloseOutlined className='text-2xl' />
						</span>
					) : (
						<span onClick={() => setIsSideBarOpen(true)}>
							<MenuOutlined className='text-2xl' />
						</span>
					)}

					<Link
						href='/'
						className={`${
							isSideBarOpen ? "fixed left-[4rem]" : "relative"
						}  logo flex items-center justify-center`}
					>
						<Image src='/assets/logo.svg' alt='logo' width={25} height={31} />
						<h1 className='font-semibold text-lg ml-1'>BountyBird</h1>
					</Link>
				</div>
			) : (
				<div>

				<Link href='/'>
					<h1 className='font-bolder font-helvetica-md text-lg md:text-2xl'>Welcome to BountyBird</h1>
				</Link>
				<div className="flex items-center font-helvetica-light text-xs mt-1 text-[#B7BCC7] ">
				<p>Powered by</p>
				<Link  className="flex"  href='https://www.townhallgov.com/' target='_blank' rel='noreferrer'>
				<Image title='Townhall' className="mx-2" src='/assets/townhallWhite.svg' alt='townhall' width={18} height={18} />
				</Link>
                <p>Built on</p>
				<Link  className="flex"  href='https://hey.xyz/' target='_blank' rel='noreferrer'>

				<Image title='Lens' className="mx-2" src='/assets/lens-icon.svg' alt='lens' width={18} height={18} />
				</Link>
			</div>
				</div>
			)}
			<div className='flex gap-2 items-center'>
			
				<div className='hidden sm:flex gap-2 items-center'>
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

				<Auth />
			</div>
		</div>
	);
};

export default Header;
