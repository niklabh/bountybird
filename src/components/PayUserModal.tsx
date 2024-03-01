import { IUser, NotificationStatus } from "../types";
import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Tooltip } from "antd";
import styled from "styled-components";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import nextApiClientFetch from "../utils/nextApiClientFetch";
import LoadingState from "./ui-components/LoadingState";
import queueNotification from "./ui-components/QueueNotification";
import Link from "next/link";
import Image from "next/image";
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

const PayUserModal = ({
  userId,
  bountyId,
  idSource,
  modalOpen,
  replyId,
  amount,
  setModalOpen,
}: {
  userId: string;
  bountyId: string;
  modalOpen: boolean;
  replyId: string;
  idSource: string;
  amount: string;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [wallet, setWallet] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const { user } = usePrivy();

  const [loading, setLoading] = useState<boolean>(false);

  const saveTxHash = async () => {
    if (!wallet || !txHash) return;

    const { data, error: fetchError } = await nextApiClientFetch<IUser>(
      `api/v1/bounty/${bountyId}/reply/${replyId}/addTxHash`,
      {
        hash: txHash,
      }
    );

    if (fetchError || !data) {
      queueNotification({
        header: "Error adding transaction hash, Please try again",
        message: fetchError,
        status: NotificationStatus.ERROR,
      });
    } else {
      queueNotification({
        header: "Success!",
        message: "Transaction hash added successfully",
        status: NotificationStatus.SUCCESS,
      });
      setModalOpen(false);
    }
  };

  const handleSubmit = () => {
    saveTxHash();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      console.log("Wallet address copied to clipboard");
    } catch (error) {
      console.error("Failed to copy wallet address to clipboard:", error);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const userExtractedId = idSource === 'lens' ? userId.split('lens/')[1] : userId;
      const { data, error: fetchError } = await nextApiClientFetch<IUser>(
        `api/v1/profile/${userExtractedId}`,
        {
          usernameSource: idSource,
        }
      );

      if (fetchError || !data) {
        queueNotification({
          header: "Error in fetching user profile",
          message: fetchError,
          status: NotificationStatus.ERROR,
        });
        setLoading(false);
      } else {
        setWallet(user?.wallet?.address || '');
        setLoading(false);
      }
    }

   if(modalOpen) fetchUser();
  }, [userId, idSource, modalOpen, user]);

  return (
    <StyledModal
    closeIcon = {<Image
      src='/assets/close.svg'
      alt='close'
      width={16}
      height={16}
    />}
      title="Pay User"
      open={modalOpen}
      onOk={handleSubmit}
      onCancel={() => setModalOpen(false)}
      footer={[
        <Button
          key="back"
          className="text-white font-semibold"
          onClick={() => setModalOpen(false)}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          className='bg-purple hover:bg-blue-700 text-white font-bold rounded'
          type="primary"
          onClick={handleSubmit}
        >
          Mark as Paid
        </Button>,
      ]}
    >
      {loading ? (
        <LoadingState />
      ) : (
        //TODO: check if user wallet is linked (if linked proceed to payment e)
        <>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="wallet">
              Wallet Address
            </label>
            {wallet ? (
              <div className="bg-black border border-[#2F45C6] p-5 w-full relative min-h-20">
                {wallet}
                <span
                  className="absolute top-0 right-1 text-lg cursor-pointer"
                  onClick={handleCopy}
                >
                  <Tooltip title={copied ? "Copied!" : "Copy tweet"}>
                    {copied ? (
                      <CheckOutlined
                        style={{ fontSize: "16px", color: "#A3E440" }}
                      />
                    ) : (
                      <CopyOutlined />
                    )}
                  </Tooltip>
                </span>
              </div>
            ) : (
              <>
                <p className="mb-2">Wallet not provided</p>
                <Link
                  href={`/profile/${userId}?source=${idSource}`}
                  className='bg-purple hover:bg-blue-700 text-white font-bold rounded-full px-3 py-1 my-2'

                >
                  View User Profile
                </Link>
              </>
            )}
          </div>
          {amount.match(/\d/) !== null ? <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="txHash">
              Enter Transaction Hash
            </label>
            <Input
              id="txHash"
              type="txHash"
              placeholder="0x97d99bc7729211111a4ff477d0477538ff017"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
							className={`shadow placeholder:text-gray-500 appearance-none border focus:bg-black hover:bg-black rounded w-full py-2 px-3 border-[#434343] focus:border-[#2F45C6] bg-black text-gray-300 leading-tight focus:outline-none focus:shadow-outline`}

            />
          </div> : <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="txHash">
              Enter a message or link
            </label>
            <Input
              id="txHash"
              type="text"
              placeholder="A message or link to the transaction"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
							className={`shadow placeholder:text-gray-500 appearance-none border focus:bg-black hover:bg-black rounded w-full py-2 px-3 border-[#434343] focus:border-[#2F45C6] bg-black text-gray-300 leading-tight focus:outline-none focus:shadow-outline`}

            />
          </div> }
        </>
      )}
    </StyledModal>
  );
};

export default PayUserModal;
