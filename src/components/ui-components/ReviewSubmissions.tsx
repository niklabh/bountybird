import { IBounty, NotificationStatus } from "@/src/types";
import Image from "next/image";
import React, { useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import acceptRejectBounty from "@/src/utils/acceptRejectBounty";
import queueNotification from "./QueueNotification";
import { getBountyById } from "@/src/api-utils/getBountyById";

const ReviewSubmission = ({
	bounty,
	setBounty,
	isBountyOwner,
}: {
	bounty: IBounty;
	setBounty: React.Dispatch<React.SetStateAction<any>>;
	isBountyOwner: boolean;
}) => {
	const [loading, setLoading] = useState<string[]>([]);

	const actionReply = async (bountyId: string, replyId: string, action: boolean) => {
		setLoading([...loading, replyId]);
		{
			const { data, error } = await acceptRejectBounty(bountyId, replyId, action);
			if (data) {
				const message = action ? "Bounty Accepted" : "Bounty Rejected";
				queueNotification({
					header: "Success",
					message: message,
					status: NotificationStatus.SUCCESS,
				});
			}
		}
		const { data, error: fetchError } = await getBountyById(bountyId);
		if (data) {
			setBounty(data);
		}
		setLoading(loading.filter((id) => id !== replyId));
	};

	return (
		<article>
			<div className='relative w-100 bg-black rounded-xl min-w-[700px]'>
				<div className='h-[43px] w-full bg-[#202020] rounded-xl'>
					<div className='grid grid-cols-12 w-full relative top-[12px] left-[12px]'>
						<span className='col-span-3 text-white text-[12px] tracking-[0.36px] relative mt-[-1.00px] font-semibold'>
							HUNTER
						</span>
						<span className='col-span-4 mt-[-1.00px] font-semibold text-white text-[12px] tracking-[0.36px]'>
							SUBMISSION
						</span>
						<span className='col-span-2 mt-[-1.00px] flex justify-center font-semibold text-white text-[12px] tracking-[0.36px]'>
							PLATFORM
						</span>
						<span className='col-span-3 flex justify-center mt-[-1.00px] font-semibold text-white text-[12px] tracking-[0.36px]'>
							ACTIONS
						</span>
					</div>
				</div>
				<div className='inline-flex w-full flex-col items-start gap-[20px] py-4 mx-3'>
					{bounty.replies &&
						bounty.replies.map((reply, idx) => (
							<div
								key={idx}
								className='grid grid-cols-12 w-full items-center justify-between relative'
							>
								<div className='col-span-3 inline-flex items-center  gap-[10px] relative min-w-50'>
									<Image width={50} height={50} alt='Leon' src='/assets/profile-image.png' />
									<div className='inline-flex flex-col items-start gap-[4px] relative'>
										<div className='text-[#464e5f] text-[14px] tracking-[0] font-semibold leading-[normal]'>
											{reply.display_name}
										</div>
										<div className=' text-[#b5b5c3] text-[13px] tracking-[0] leading-[normal]'>
											@{reply.username}
										</div>
									</div>
								</div>
								<div className='col-span-4 inline-flex flex-col items-start gap-[4px] relative'>
									<div className=' font-semibold  text-[#464e5f] text-[14px] tracking-[0] leading-[normal] pr-5'>
										{reply.text}
									</div>
								</div>
								<div className='col-span-2 flex justify-center  items-center'>
									{reply.source === "twitter" ? (
										<Image width={30} height={35} alt='Veru' src='/assets/twitterX.svg' />
									) : reply.source === "lens" ? (
										<Image width={30} height={35} alt='Veru' src='/assets/lens2.svg' />
									) : (
										<Image width={30} height={35} alt='Veru' src='/assets/logo.svg' />
									)}
								</div>
								{isBountyOwner ? (
									<div className='col-span-3 inline-flex items-center  gap-[8px] relative'>
										<button
											disabled={loading.includes(reply.id)}
											onClick={() => actionReply(bounty.id, reply.id, true)}
											className={` ${
												"accepted" in reply &&
												reply.accepted &&
												"border-2 border-green-500 bg-green-500  px-4"
											} px-6 py-1 bg-[#2f45c6] text-sm text-center font-medium rounded-full`}
										>
											Accept{"accepted" in reply && reply.accepted && <span>ed</span>}
										</button>
										<button
											disabled={loading.includes(reply.id)}
											onClick={() => actionReply(bounty.id, reply.id, false)}
											className={`${
												"accepted" in reply &&
												!reply.accepted &&
												"border-2 border-red-400 text-red-500 font-thin"
											} border px-6  py-1 border-[#2f45c6] font-medium text-[#2f45c6] text-sm text-center rounded-full`}
										>
											Reject{"accepted" in reply && !reply.accepted && <span>ed</span>}
										</button>
										{loading.includes(reply.id) && (
											<Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
										)}
									</div>
								) : (
									<div className='col-span-3 inline-flex items-center justify-center  gap-[8px] relative'>
										{!("accepted" in reply)
											? "Pending review"
											: reply.accepted
											? "Accepted"
											: "Rejected"}
									</div>
								)}
							</div>
						))}
				</div>
			</div>
		</article>
	);
};

export default ReviewSubmission;
