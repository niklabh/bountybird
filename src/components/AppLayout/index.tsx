import React, { useState } from "react";
import Header from "./Header";
import dynamic from 'next/dynamic';

const SideBar = dynamic(() => import('./SideBar'), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);
	return (
		<div className='flex'>
			<SideBar isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />
			<div className='w-full max-w-6xl mx-auto md:pl-16 py-3'>
				<Header isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />
				<main className='px-5 xl:px-0'>{children}</main>
			</div>
		</div>
	);
}
