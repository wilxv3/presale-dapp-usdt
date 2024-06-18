"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import { Contract } from "ethers";
import { abi, presale_contract } from "./presale_contract";
import ConnectButton from "./connect";
import { BrowserProvider } from "ethers";
import {
  useSwitchNetwork,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { USDT_abi, USDT_contract } from "./usdt_contract";
import logo from "@/public/logo.png";
import gift from "@/public/gift.png";
import bg from "@/public/bg.jpg";
import tether from "@/public/tether.png";
import { bscMainnet } from "./wc-config";

const pkg = {
  total: 5000,
  price: 3,
};

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [availablePackages, setAvailablePackages] = useState(0);
  const [countdown, setCountdown] = useState<string>("");
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const targetDate = new Date("September 1, 2024 00:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    const interval = setInterval(updateCountdown, 1000);
    if(walletProvider) setPackagesLeft();
    return () => clearInterval(interval);
  }, [walletProvider]);

  const approveToken = async () => {
    const ethersProvider = new BrowserProvider(walletProvider!);
    const signer = await ethersProvider.getSigner();
    const usdt_contract = new Contract(USDT_contract, USDT_abi, signer);
    const approve_tx = await usdt_contract.approve(
      presale_contract,
      ethers.parseUnits(pkg.price.toString(), 18)
    );
    await approve_tx.wait();
  };

  const buyToken = async () => {
    const ethersProvider = new BrowserProvider(walletProvider!);
    const signer = await ethersProvider.getSigner();
    const contract = new Contract(presale_contract, abi, signer);
    const tx = await contract.buyWithUsdt();
    await tx.wait();
  };

  const setPackagesLeft = async () => {
    try {
      const ethersProvider = new BrowserProvider(walletProvider!);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(presale_contract, abi, signer);
      const soldPackages = await contract.getSold();
      const availPackages = pkg.total - Number(soldPackages);
      setAvailablePackages(availPackages);
    } catch (error) {
      console.error("Error fetching sold packages:", error);
      setError("Error fetching sold packages");
    }
  };

  const addToken = async (name: string) => {
    const tokenAddress =
      name === "AST"
        ? "0x07ca2765Ed92ce728c22927e2D7AfbDC8AbaD3cd"
        : USDT_contract; // Replace with your token contract address
    const tokenSymbol = name; // Replace with your token symbol
    const tokenDecimals = 18; // Replace with your token decimals
    // const tokenImage = "https://example.com/token-image.png"; // Replace with your token image URL

    if (window.ethereum && window.ethereum.request) {
      try {
        const wasAdded = await (window as any).ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: tokenAddress,
              symbol: tokenSymbol,
              decimals: tokenDecimals,
              // image: tokenImage,
            },
          },
        });

        if (wasAdded) {
          console.log("Token added!");
        } else {
          console.log("Token not added");
        }
      } catch (error) {
        console.error("Error adding token:", error);
      }
    } else {
      alert(
        "Import 0x07ca2765Ed92ce728c22927e2D7AfbDC8AbaD3cd into your wallet app."
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      <div className="flex flex-col items-center justify-center bg-black bg-opacity-50 min-h-screen">
        <div className="w-full text-center text-white py-4 bg-gradient-to-r from-purple-500 to-blue-500">
          <h1 className="text-lg md:text-xl lg:text-2xl font-serif font-bold">
            Countdown PRE-LIST Adamas: {countdown}
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center space-y-6 py-8">
          <ConnectButton />
          <div className="relative w-full max-w-md mx-4 bg-black bg-opacity-75 text-white p-8 rounded-lg border-4 border-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
            <button
              className="absolute top-4 left-4 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 font-serif"
              onClick={() => addToken("USDT")}
            >
              Add USDT
            </button>
            <div className="flex flex-col items-center space-y-3">
              <Image src={logo} alt="Project Logo" width={120} height={120} />
              <h1 className="text-3xl font-serif font-bold pb-2">
                Adamas Project
              </h1>
              <h2 className="text-xl font-serif">Pre-listed</h2>
              <p className="pb-2 font-serif">Price: {pkg.price} USDT</p>
              <hr className="w-full border-gray-500 pb-3" />
              <p className="font-serif">
                TICKETS: {availablePackages}
              </p>
              <p className="pb-2 font-serif">You will receive 1000 AST</p>
              <button
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 font-serif"
                onClick={() => {
                  if (address) {
                    approveToken().then(() => {
                      buyToken();
                    });
                  } else {
                    alert("Please connect your wallet");
                  }
                }}
              >
                PRE-LIST NOW
              </button>
              <Image src={tether} alt="tether" width={150} height={150} />
              <div className="flex space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-serif"
                  onClick={() => addToken("AST")}
                >
                  Add Token AST
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-serif"
                  onClick={() =>
                    address
                      ? switchNetwork(bscMainnet.chainId)
                      : alert("Please connect your wallet")
                  }
                >
                  Add Network BNB
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
