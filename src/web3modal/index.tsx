import {
  createWeb3Modal,
  defaultWagmiConfig,
  useWeb3Modal,
} from "@web3modal/wagmi/react";
import { arbitrum, mainnet, polygon, polygonMumbai } from "viem/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

const metadata = {
  name: "BountyBird",
  description: "Transforming Bounties into Social Experiences",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const chains = [mainnet, polygon, polygonMumbai, arbitrum];

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
});

// On web, export W3mButton as the globally-available web component
const ConnectWalletButton = (props: any) => <w3m-button {...props} />;

// Re-export components
export { wagmiConfig, useWeb3Modal, ConnectWalletButton };