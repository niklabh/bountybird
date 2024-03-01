import React, { FC, useState } from 'react'
import ConnectLensModal from '../../ConnectLensModal';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useDisconnect, useAccount } from 'wagmi';

interface ILinkLens {
    lensHandle?: string;
    formError?: string;
}

const LinkLens: FC<ILinkLens> = (props) => {
    const { lensHandle, formError } = props;
    const [connectLensOpen, setConnectLensOpen] = useState(false);
	const { disconnect } = useDisconnect();
	const { address, isConnected } = useAccount();
	const { open } = useWeb3Modal();

    const linkLens = () => {
        if (isConnected && address) {
            setConnectLensOpen(true);
        } else {
            disconnect();
            open({ view: "Connect" });
        }
    };

    return (
        <>
            <ConnectLensModal
                modalOpen={connectLensOpen}
                setModalOpen={setConnectLensOpen}
                address={address}
            />
            <label
                className="block tracking-widest text-gray-300 text-sm font-bold mb-2"
                htmlFor="lens"
            >
                Lens
            </label>
            {lensHandle ? (
            <p className="mb-5">@{lensHandle}</p>
            ) : (
            <button
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight hover:bg-white hover:text-darkBlue mb-5 ${
                formError ? "border-red-500" : ""
                }`
                }
                onClick={linkLens}
            >
                {
                    isConnected && address?
                    'Link Lens'
                    : 'Connect wallet for linking lens'
                }
            </button>
            )}
        </>
    );
}

export default LinkLens