import React, { useEffect, useState } from "react";
import { NotificationStatus, IUser } from "../types";
import { useLogin } from "@lens-protocol/react-web";
import Image from "next/image";
import { Button, Modal } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ProfileId } from "@/src/lib/lens-sdk";
import styled from "styled-components";
import {
	Profile,
	ProfilePictureSet,
	useLastLoggedInProfile,
	useProfilesManaged,
} from "@/src/lib/lens-sdk";
import queueNotification from "./ui-components/QueueNotification";
import { usePrivy } from "@privy-io/react-auth";
import editProfile from "../utils/editProfile";
import { profileActions } from "../redux/profile";
import { useDispatch } from "react-redux";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "../web3modal";

type ModalProps = {
	modalOpen: boolean;
	setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	address?: string;
};

const StyledModal = styled(Modal)`
	.ant-modal-content {
		background-color: #000;
		color: var(--accent);
		border: 1px solid var(--accent);
	}
	.ant-modal-header {
		background-color: #000;
		color: var(--accent);
		padding-bottom: 6px;
		border-bottom: 1px solid var(--accent);
	}
	.ant-modal-title {
		color: var(--accent);
	}
	.ant-modal-close {
		color: var(--accent);
	}
	.ant-modal-body {
		padding-block: 1rem;
	}
`;

function ConnectLensModal({ modalOpen, setModalOpen, address }: ModalProps) {
	const [sortedProfiles, setSortedProfiles] = useState<Profile[]>([]);

	const { data: profiles = [] } = useProfilesManaged({
		for: `${address}`,
	});

	const { data: lastLoggedInProfile } = useLastLoggedInProfile({
		for: `${address}`,
	});

	useEffect(() => {
		// Sort the profiles so that the last logged in profile is at the top
		if (profiles.length > 0) {
			const sortedTempProfiles = [...profiles].sort((a, b) => {
				if (a.id === lastLoggedInProfile?.id) {
					return -1;
				}
				if (b.id === lastLoggedInProfile?.id) {
					return 1;
				}
				return 0;
			});
			setSortedProfiles(sortedTempProfiles);
		}
	}, [lastLoggedInProfile, profiles]);

	return (
		<StyledModal
			closeIcon={<Image src='/assets/close.svg' alt='close' width={16} height={16} />}
			open={modalOpen}
			onCancel={() => setModalOpen(false)}
			footer={null}
			title='Connect Lens'
		>
			<>
				{profiles && profiles.length ? (
					<div className='flex flex-col gap-5'>
						<p className='text-lg font-semibold'>Choose profile to sign in with</p>
						{sortedProfiles.map((profile) => {
							const avatarImageUri = (profile.metadata?.picture as ProfilePictureSet)?.thumbnail
								?.uri;

							return (
								<div
									key={profile.id}
									className='border border-secondary rounded-xl p-3 flex gap-2 items-center'
								>
									<div className='bg-secondary overflow-hidden text-white rounded-full w-16 aspect-square flex items-center justify-center'>
										{avatarImageUri ? (
											<Image alt='Profile avatar' src={avatarImageUri} width={64} height={64} />
										) : (
											<UserOutlined className='text-3xl' />
										)}
									</div>

									<div>
										{profile.metadata?.displayName && (
											<p className='font-semibold'>{profile.metadata.displayName}</p>
										)}

										{profile.handle?.localName && <p>@{profile.handle?.localName}</p>}
									</div>

									<LensButton
										profileId={profile.id}
										className='ml-auto'
										setModalOpen={setModalOpen}
									/>
								</div>
							);
						})}
					</div>
				) : (
					<div className='flex gap-5 items-center justify-between'>
						<p className='text-sm font-semibold'>No lens profiles found for logged in wallet.</p>
					</div>
				)}
			</>
		</StyledModal>
	);
}

type LensButtonProps = {
	profileId: ProfileId;
	setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	className?: string;
};

function LensButton({ profileId, className, setModalOpen }: LensButtonProps) {
	const { execute: login, loading: loginLoading } = useLogin();
	const [loading, setLoading] = useState<boolean>(false);
	const { user } = usePrivy();
	const dispatch = useDispatch();

	const saveLensProfile = async (lens_handle: string) => {
		if (!lens_handle) return;
		setLoading(true);

		const { data, error: fetchError } = await editProfile<IUser>({
			lens_handle,
		});

		if (fetchError || !data) {
			queueNotification({
				header: "Error connecting lens profile",
				message: fetchError,
				status: NotificationStatus.ERROR,
			});
		} else {
			dispatch(profileActions.setUser(data));
			queueNotification({
				header: "Success!",
				message: `You have successfully connected your lens profile with username @${lens_handle}`,
				status: NotificationStatus.SUCCESS,
			});
			setModalOpen(false);
			setLoading(false);
		}
	};

	const onLogin = async () => {
		if (!user?.wallet?.address) return;

		const loginResult = await login({
			address: user?.wallet?.address,
			profileId,
		});

		if (loginResult.isFailure()) {
			queueNotification({
				header: "Error in connecting lens",
				message: loginResult.error.message,
				status: NotificationStatus.ERROR,
			});
			return;
		}

		if (loginResult.isSuccess()) {
			const username = loginResult.value?.handle?.fullHandle;
			username && saveLensProfile(username);
		}
	};

	return (
		<Button
			className={`${className} bg-white text-darkBlue font-semibold`}
			loading={loginLoading || loading}
			onClick={onLogin}
		>
			Link
		</Button>
	);
}

export default ConnectLensModal;
