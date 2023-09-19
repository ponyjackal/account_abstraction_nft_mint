import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
import { ethers } from "ethers";
import { useState } from "react";
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";

const inter = Inter({ subsets: ["latin"] });

const PAYMASTER_URL = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL as string;
const BUNDLER_URL = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL as string;
const PARTICLE_PROJECT_ID = process.env
  .NEXT_PUBLIC_PARTICLE_PROJECT_ID as string;
const PARTICLE_CLIENT_KEY = process.env
  .NEXT_PUBLIC_PARTICLE_CLIENT_KEY as string;
const PARTICLE_APP_ID = process.env.NEXT_PUBLIC_PARTICLE_APP_ID as string;

console.log("PAYMASTER_URL", PAYMASTER_URL, BUNDLER_URL);

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(
    null
  );
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );

  const particle = new ParticleAuthModule.ParticleNetwork({
    projectId: PARTICLE_PROJECT_ID,
    clientKey: PARTICLE_CLIENT_KEY,
    appId: PARTICLE_APP_ID,
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
    },
  });
  const bundler: IBundler = new Bundler({
    bundlerUrl: BUNDLER_URL,
    chainId: ChainId.BASE_GOERLI_TESTNET,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: PAYMASTER_URL, // paymaster url from dashboard
  });

  const connect = async () => {
    try {
      setLoading(true);
      const userInfo = await particle.auth.login();
      console.log("Logged in user:", userInfo);
      const particleProvider = new ParticleProvider(particle.auth);
      const web3Provider = new ethers.providers.Web3Provider(
        particleProvider,
        "any"
      );
      setProvider(web3Provider);
      const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.BASE_GOERLI_TESTNET,
        bundler: bundler,
        paymaster: paymaster,
      };
      let biconomySmartAccount = new BiconomySmartAccount(
        biconomySmartAccountConfig
      );
      biconomySmartAccount = await biconomySmartAccount.init();
      setAddress(await biconomySmartAccount.getSmartAccountAddress());
      setSmartAccount(biconomySmartAccount);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>Based Account Abstraction</title>
        <meta name="description" content="Based Account Abstraction" />
      </Head>
      <main className={styles.main}>
        <h1>Based Account Abstraction</h1>
        <h2>Connect and Mint your AA powered NFT now</h2>
        {!loading && !address && (
          <button onClick={connect} className={styles.connect}>
            Connect to Based Web3
          </button>
        )}
        {loading && <p>Loading Smart Account...</p>}
        {address && <h2>Smart Account: {address}</h2>}
      </main>
    </>
  );
}
