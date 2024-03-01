import { IUser } from '@/src/types';
import { User } from '@privy-io/react-auth';
import { Popover } from 'antd';
import React, { FC } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { DownOutlined } from "@ant-design/icons";

interface IProfileProps {
    logout: () => void;
    privyUser: User | null;
    user: IUser | null;
}

const Profile: FC<IProfileProps> = (props) => {
    const { user, logout } = props;

	const content = (
		<div className='flex flex-col text-white w-36'>
			<Link
                href={`/profile/${user?.username? user?.username: user?.privy_user?.wallet?.address}`}
                className="cursor-pointer"
            >
                <div className=" hover:bg-slate-600 px-3 py-2 rounded-lg ">
                    View Profile
                </div>
			</Link>
			<button onClick={logout} className="text-left hover:bg-slate-600 cursor-pointer hover:text-blue-400 px-3 py-2 rounded-lg">Logout</button>
		</div>
	);
    return (
        <>
            <Popover
                color='#243149'
                content={content}
                title=''
                trigger='hover'
                arrow={false}
                overlayInnerStyle={{padding: '0px'}}
                className='p-0 m-0 flex items-center justify-center'
            >
                <p className='border border-solid border-gray-600 px-3 rounded-full h-8 font-semibold text-sm min-w-[90px] md:min-w-[125px] capitalize flex items-center justify-between gap-x-2 cursor-pointer'>
                    <Image src={user?.img_url? user?.img_url: '/assets/pfp.svg'} alt='profile-pic' width={20} height={20} />
                    <p className='w-10 sm:w-20 truncate'>
                        {user?.name || user?.privy_user?.wallet?.address || ''}
                    </p>
                    <DownOutlined className='text-xs' />
                </p>
            </Popover>   
        </>
    );
}

export default Profile