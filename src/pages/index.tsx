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

export default function Home() {
  const particle = new ParticleAuthModule.ParticleNetwork({
    projectId: PARTICLE_PROJECT_ID,
    clientKey: PARTICLE_CLIENT_KEY,
    appId: "",
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
      const userInfo = await particle.auth.login();
      console.log("Logged in user:", userInfo);
      const particleProvider = new ParticleProvider(particle.auth);
      console.log({ particleProvider });
      const web3Provider = new ethers.providers.Web3Provider(
        particleProvider,
        "any"
      );
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
        <button className={styles.connect} onClick={connect}>
          Connect
        </button>
      </main>
    </>
  );
}
