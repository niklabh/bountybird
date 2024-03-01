import { useRouter } from "next/router";
import { IBounty } from "@/src/types";
import Image from "next/image";
import React from "react";
import Link from "next/link";

const Submission = ({ bounty }: { bounty: IBounty }) => {
  const router = useRouter();

  const openProfile = () => {
    // router.push(`/profile/${bounty.username}`);
    window.open(`https://twitter.com/${bounty.username}`, "_blank");
  };

  return (
    <div className="w-full p-3 border-t last:border-b">
      <div className="flex gap-2 items-center">
        <h2 className="font-bold text-2xl">{bounty.amount}</h2>
        <span>{bounty.max_claims} Total Claims</span>
        <div className="ml-auto flex items-center gap-2">
          <span>Rejected</span>
          <span className="w-1 aspect-square bg-white rounded-full"></span>
          <span>{bounty.status}</span>
        </div>
      </div>
      <div
        className={`rounded-3xl border my-2 overflow-hidden ${
          bounty.source === "twitter" ? "border-[#2F6DA6]" : "border-[#824852]"
        }`}
      >
        <div
          className={`flex gap-1 items-center p-2 px-4 border-b ${
            bounty.source === "twitter"
              ? "border-[#2F6DA6] bg-fadedBlue"
              : "border-[#824852] bg-fadedBrown"
          }`}
        >
          <Image
            src="/assets/pfp.svg"
            alt="profile-icon"
            width={24}
            height={24}
            onClick={openProfile}
          />
          <span className="font-bold cursor-pointer" onClick={openProfile}>
            {bounty.display_name}
          </span>
          <span className="cursor-pointer" onClick={openProfile}>
            @{bounty.username}
          </span>
          <Link
            href={`https://twitter.com/${bounty.username}/status/${bounty.source_id}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto"
          >
            <Image
              src={`${
                bounty.source === "twitter"
                  ? "/assets/twitter.svg"
                  : "/assets/lens-icon.svg"
              }`}
              alt="brand-icon"
              width={24}
              height={24}
            />
          </Link>
        </div>
        <div className="p-4 bg-black">
          <p className="text-sm mb-2">{bounty.task}</p>
          <p className="text-sm mb-2">Amount: {bounty.amount}</p>
          <p className="text-sm mb-2">Claims: {bounty.claims.length}</p>
          <p className="text-sm mb-2">@thebountybird</p>
        </div>
      </div>
      <div className="flex">
        <div className="flex items-center gap-5">
          <Link
            href={`https://twitter.com/${bounty.username}/status/${bounty.source_id}`}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/assets/heart-icon.svg"
              alt="heart-icon"
              width={24}
              height={24}
            />
          </Link>
          <Link
            href={`https://twitter.com/${bounty.username}/status/${bounty.source_id}`}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/assets/message-icon.svg"
              alt="message-icon"
              width={24}
              height={24}
            />
          </Link>
          <Link
            href={`https://twitter.com/${bounty.username}/status/${bounty.source_id}`}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/assets/retweet-icon.svg"
              alt="retweet-icon"
              width={24}
              height={24}
            />
          </Link>
          <Link
            href={`https://twitter.com/${bounty.username}/status/${bounty.source_id}`}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/assets/share-icon.svg"
              alt="share-icon"
              width={24}
              height={24}
            />
          </Link>
        </div>
        <div className="flex ml-auto items-center gap-2 text-sm">
          <button className="border border-purple text-purple rounded-3xl px-2 py-1">
            Mark as Received
          </button>
        </div>
      </div>
    </div>
  );
};

export default Submission;
