import React from "react";
import { dayjs } from "@/src/dayjs-init";
import Image from "next/image";
import { IBountyReply } from "@/src/types";
import LikeIcon from "@/public/assets/heart-icon.svg";
import ReplyIcon from "@/public/assets/reply-icon.svg";

const CommentReply = ({ reply }: { reply: IBountyReply }) => {
  const openProfile = () => {
    if (reply.source === "twitter") {
      window.open(`https://twitter.com/${reply.username}`, "_blank");
    } else {
      window.open(
        `https://lenster.xyz/u/${reply.username.split("lens/")[1]}`,
        "_blank"
      );
    }
  };

  return (
    <div className="w-full px-3 mt-5 border-l border-dashed">
      <div className="overflow-hidden">
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
      <div className="flex">
        {/* <div className="flex items-center gap-5">
          <span>
            <LikeIcon />
          </span>
          <span className="flex items-center gap-1">
            <ReplyIcon />
            Reply
          </span>
        </div> */}
      </div>
      <span className="text-xs mt-5">Original Poster</span>
    </div>
  );
};

export default CommentReply;
