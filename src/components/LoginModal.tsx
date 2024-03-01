import React, { useState } from "react";
import { Modal, Button, Input } from "antd";
import Image from "next/image";
import BirdImg from "@/public/assets/bounty-bird-mobile.png";
import styled from "styled-components";
import { usePrivy } from "@privy-io/react-auth";

const StyledModal = styled(Modal)`
	.ant-modal-content {
		background-color: black;
		color: var(--accent);
		border: 1px solid var(--accent);
	}
	.ant-modal-header {
		background-color: black;
		color: var(--accent);
		padding-bottom: 0.5rem;
		border-bottom: 1px solid slategray;
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

const LoginModal = ({
	modalOpen,
	setModalOpen,
}: {
	modalOpen: boolean;
	setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { authenticated: isUserAuthenticated, login, user } = usePrivy();

	const handleSubmit = async () => {};

	return (
		<>
			<StyledModal
			closeIcon = {<Image
				src='/assets/close.svg'
				alt='close'
				width={16}
				height={16}
			/>}
				title='Hey there!'
				open={modalOpen}
				onOk={handleSubmit}
				onCancel={() => setModalOpen(false)}
				footer={null}
			>
				<div className='mb-4 w-full flex flex-col justify-center items-center'>
					<div className='flex w-full justify-center items-center relative right-9'>
						<Image
							src={BirdImg}
							className='cursor-pointer transition-all '
							alt='brand-icon'
							width={120}
							height={120}
						/>
						<h1 className='text-3xl font-bold font-helvetica-md'>Like what you see?</h1>
					</div>
					<h1 className='text-xl font-bold mb-8'>Login to join the fun !</h1>
					<button
						className='bg-purple font-dmsams-light text-white hover:bg-[#3651f3] hover:border border-white rounded-3xl px-3 md:px-5 py-1'
						onClick={login}
					>
						Login
					</button>
				</div>
			</StyledModal>
		</>
	);
};

export default LoginModal;
