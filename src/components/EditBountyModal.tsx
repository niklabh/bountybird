import { BountyStatus, IApiSuccessResponse, IBounty, NotificationStatus } from "../types";
import React, { useState } from "react";
import { Modal, Button, Input, DatePicker, DatePickerProps } from "antd";
import styled from "styled-components";
import nextApiClientFetch from "../utils/nextApiClientFetch";
import LoadingState from "./ui-components/LoadingState";
import { DownOutlined } from "@ant-design/icons";
import queueNotification from "./ui-components/QueueNotification";
import dayjs from "dayjs";
import { getBountyById } from "../api-utils/getBountyById";
import Image from "next/image";

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
	.ant-picker-input > input {
		color: var(--text-gray-300);
	}
`;

const EditBountyModal = ({
	bounty,
	modalOpen,
	setModalOpen,
	setBounty,
}: {
	bounty: IBounty;
	modalOpen: boolean;
	setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setBounty: React.Dispatch<React.SetStateAction<any>>;
}) => {
	const [bountyData, setBountyData] = useState({
		task: bounty.task,
		amount: bounty.amount,
		deadline: bounty.deadline,
		max_claims: bounty.max_claims,
	});
	const [loading, setLoading] = useState<boolean>(false);

	const onChangeDate: DatePickerProps["onChange"] = (date, dateString) => {
		setBountyData({ ...bountyData, deadline: date?.toDate() });
	};

	const handleSubmit = async () => {
		// Call API to confirm twitter username
		setLoading(true);
		const { data, error: fetchError } = await nextApiClientFetch<IApiSuccessResponse>(
			`api/v1/bounty/${bounty.id}/edit`,
			{
				task: bountyData.task,
				amount: bountyData.amount,
				deadline: bountyData.deadline,
				max_claims: bountyData.max_claims,
			}
		);

		if (fetchError || !data) {
			queueNotification({
				header: "Error updating bounty",
				message: fetchError,
				status: NotificationStatus.ERROR,
			});
			setLoading(false);
		} // data exists
		else {
			queueNotification({
				header: "Success!",
				message: data.message,
				status: NotificationStatus.SUCCESS,
			});

            const { data: bountyGetData, error: fetchBountyError } = await getBountyById(bounty.id);
            if (fetchBountyError || !bountyGetData) {
				console.log("fetchError : ", fetchBountyError);
				setLoading(false);
			} // data exists
			else {
				setBounty(bountyGetData);
			}

			setModalOpen(false);
			setLoading(false);
		}
	};

	return (
		<StyledModal
	         closeIcon = {<Image
				src='/assets/close.svg'
				alt='close'
				width={16}
				height={16}
			/>}
			title='Edit Bounty'
			open={modalOpen}
			onOk={handleSubmit}
			onCancel={() => setModalOpen(false)}
			footer={[
				<Button key='back' className='text-white font-semibold' onClick={() => setModalOpen(false)}>
					Cancel
				</Button>,
				<Button
					key='submit'
					className='bg-purple hover:bg-blue-700 text-white font-bold rounded'
					type='primary'
					onClick={handleSubmit}
				>
					Confirm
				</Button>,
			]}
		>
			{loading ? (
				<LoadingState />
			) : (
				<>
					<div className='mb-4'>
						<label className='block text-sm font-bold mb-2' htmlFor='task'>
							Task
						</label>
						<Input
							className={`shadow appearance-none border rounded w-full py-2 px-3 border-[#434343] focus:border-[#2F45C6] bg-black text-gray-300 leading-tight focus:outline-none focus:shadow-outline`}
							id='task'
							type='text'
							placeholder='task'
							value={bountyData.task}
							onChange={(e) => setBountyData({ ...bountyData, task: e.target.value })}
						/>
						<label className='block text-sm font-bold my-2' htmlFor='amount'>
							Amount
						</label>
						<Input
							className={`shadow appearance-none border rounded w-full py-2 px-3 border-[#434343] focus:border-[#2F45C6] bg-black text-gray-300 leading-tight focus:outline-none focus:shadow-outline`}
							id='amount'
							type='text'
							placeholder='bounty amount'
							value={bountyData.amount}
							onChange={(e) => setBountyData({ ...bountyData, amount: e.target.value })}
						/>
						
						<label className='block text-sm font-bold my-2' htmlFor='claims'>
							Max Claims
						</label>
						<Input
							className={`shadow appearance-none border rounded w-full py-2 px-3 border-[#434343] focus:border-[#2F45C6] bg-black text-gray-300 leading-tight focus:outline-none focus:shadow-outline`}
							id='claims'
							type='number'
							placeholder='Enter maximum claims'
							value={bountyData.max_claims}
							onChange={(e) => setBountyData({ ...bountyData, max_claims: +e.target.value })}
						/>
						<label className='block text-sm font-bold my-2' htmlFor='deadline'>
							Deadline
						</label>
						<DatePicker
						    changeOnBlur={true}
							id='deadline'
							defaultValue={dayjs(bountyData.deadline, "YYYY-MM-DD HH:mm:ss")}
							className='border rounded w-full leading-tight text-white px-3 border-[#434343] focus:border-[#2F45C6] bg-black'
							onChange={onChangeDate}
							
							showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
						/>
					
					</div>
				</>
			)}
		</StyledModal>
	);
};

export default EditBountyModal;
