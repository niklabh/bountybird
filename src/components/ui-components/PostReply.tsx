import React, { useEffect } from "react";
import { dayjs } from "@/src/dayjs-init";
import Image from "next/image";
import { Tooltip } from "antd";
import { IBountyReply } from "@/src/types";
import CommentReply from "./CommentReply";
import { CheckOutlined, LoadingOutlined  } from "@ant-design/icons";
import PayUserModal from "../PayUserModal";
import { useState } from "react";
import LikeIcon from "@/public/assets/heart-icon.svg";
import ReplyIcon from "@/public/assets/reply-icon.svg";
import { useRouter } from "next/navigation";
import { useProfileSelector } from "@/src/redux/selectors";

const PostReply = ({
  reply,
  isBountyOwner,
  bountyId,
  amount
}: {
  reply: IBountyReply;
  isBountyOwner: boolean;
  bountyId: string;
  amount: string
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isSubmitter, seIsSubmitter] = useState<boolean>(false);
  const router = useRouter();
  const { user } = useProfileSelector();

  const openProfile = () => {
    if (reply.source === "twitter") {
      router.push(`/profile/${reply.username}?source=twitter`);
    } else if (reply.source === "lens") {
      router.push(`/profile/${reply.username.split("/")[1]}?source=lens`);
    } else if (reply.source === "bounty bird") {
      router.push(`/profile/${reply.source_author_id}`);
    } else {
      window.open(
        `https://lenster.xyz/u/${reply.username.split("lens/")[1]}`,
        "_blank"
      );
    }
  };

  useEffect(() => {
    if (user?.username === reply.username) {
      seIsSubmitter(true);
    }
  },[user, reply])

  return (
    <>
      <PayUserModal
        userId={reply.username}
        idSource={reply.source}
        bountyId={bountyId}
        replyId={reply.id}
        amount={amount}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      />
      <div className="w-full p-3 mt-2 border-b last:border-none">
        <div className="my-2 overflow-hidden">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/pfp.svg"
              alt="profile-icon"
              width={24}
              height={24}
            />
            <div className="flex flex-col text-sm ml-1 md:gap-2 md:text-lg md:flex-row">
              <span className="font-bold cursor-pointer" onClick={openProfile}>
                {reply.display_name}
              </span>
              <span className="cursor-pointer" onClick={openProfile}>
                @{reply.username}
              </span>
            </div>
            <span className="w-1 ml-auto text-xs md:ml-0 md:text-sm aspect-square bg-white rounded-full"></span>
            {dayjs(reply.created_at).isBefore(dayjs().subtract(1, "w"))
              ? dayjs(reply.created_at).format("DD-MM-YY")
              : dayjs(reply.created_at).startOf("day").fromNow()}
          </div>
          <p className="text-sm py-4">{reply.text}</p>
        </div>
        <div className="flex items-center">
          {/* <div className="flex items-center gap-5">
            <span>
              <LikeIcon />
            </span>
            <span className="flex items-center gap-1">
              <ReplyIcon />
              Reply
            </span>
          </div> */}
          {isBountyOwner &&
            (reply.txHash !== undefined ? (
              <Tooltip title={`txHash: ${reply.txHash}`}>
                <span className="bg-purple text-white rounded-3xl flex items-center gap-1 px-4 py-1 text-xs md:text-sm ml-auto">
                  <CheckOutlined />
                  Paid
                </span>
              </Tooltip>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="bg-purple text-white rounded-3xl px-4 py-1 text-xs md:text-sm ml-auto"
              >
                Pay User
              </button>
            ))}

            {isSubmitter && 
              (reply.txHash !== undefined ? (
                <Tooltip className="border" title={`txHash: ${reply.txHash}`}>
                  <span className="bg-purple text-white rounded-3xl flex items-center gap-1 px-4 py-1 text-xs md:text-sm ml-auto">
                    <CheckOutlined />
                    Paid
                  </span>
                </Tooltip>
              ) : (
                <span className="bg-purple text-white rounded-3xl flex items-center gap-1 px-4 py-1 text-xs md:text-sm ml-auto">
                Pending...
              </span>
              ))}
        </div>
        <span className="text-xs mt-5">1st degree follower</span>
        {/* <CommentReply reply={reply} /> */}
      </div>
    </>
  );
};

export default PostReply;
