import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PrivyProvider } from "@privy-io/react-auth";
import AppLayout from "@/src/components/AppLayout";
import { LensProvider, lensConfig } from "@/src/lib/lens-sdk";
import { PersistGate } from 'redux-persist/integration/react';
import { useStore } from 'react-redux';
import { wrapper } from "@/src/redux/store";
import { FC } from "react";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "@/src/web3modal";

const App: FC<AppProps> = ({ Component, pageProps }) => {
	const store: any = useStore();
  return (
    <>
      <PersistGate persistor={store.__persistor}>
        {() => (
          <PrivyProvider
            appId={`${process.env.NEXT_PUBLIC_PRIVY_APP_ID}`}
            config={{
              loginMethods: ["wallet", "email", "google", "twitter", "discord"],
              appearance: {
                showWalletLoginFirst: true,
                theme: "#232946",
                accentColor: "#fffffe",
                logo: "/assets/logo.svg",
              },
              legal: {
                termsAndConditionsUrl: "https://bountybird.io/terms",
              },
            }}
          >
            <WagmiConfig
              config={wagmiConfig}
            >
              <LensProvider config={lensConfig}>
                <AppLayout>
                  <Component {...pageProps} />
                </AppLayout>
              </LensProvider>
            </WagmiConfig>
          </PrivyProvider>
        )}
      </PersistGate>
    </>
  );
}
export default wrapper.withRedux(App);