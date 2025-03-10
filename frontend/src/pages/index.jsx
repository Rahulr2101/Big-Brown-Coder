import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/Header";
import WalletCard from "@/components/WalletCard";
import FootprintCalculator from "@/components/FootprintCalculator";
import OffsetPurchase from "@/components/OffsetPurchase"; 
import CarbonInfo from "@/components/CarbonInfo.jsx";
import web3Service from "../api/Web3Services";

const Index = () => {
  const [web3Enabled, setWeb3Enabled] = useState(false);
  const [account, setAccount] = useState("Not connected");
  const [ethBalance, setEthBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0.01);
  const [footprintEstimate, setFootprintEstimate] = useState(0);
  const [recommendedOffsets, setRecommendedOffsets] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState({
    electricityUsage: "",
    gasUsage: "",
    carTravel: "",
    flightHours: "",
    meatConsumption: "",
  });

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const initialized = await web3Service.init();
        setWeb3Enabled(initialized);

        if (initialized) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            await handleConnectWallet();
          }

          const price = await web3Service.getTokenPrice();
          setTokenPrice(parseFloat(price));
        }
      } catch (error) {
        console.error("Error initializing Web3:", error);
        toast.error("Failed to initialize Web3 connection");
      }
    };

    initializeWeb3();
  }, []);

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask to connect your wallet");
      return;
    }

    setIsLoading(true);

    try {
      const { account, ethBalance, tokenBalance } = await web3Service.connectWallet();

      if (account) {
        setAccount(account);
        setEthBalance(parseFloat(ethBalance));
        setTokenBalance(parseFloat(tokenBalance));
        toast.success("Wallet connected successfully");
      } else {
        toast.error("No account found. Please ensure MetaMask is unlocked.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect your wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const calculateFootprint = async (e) => {
    e.preventDefault();

    // Example calculation (replace with your logic)
    const total =
      parseFloat(inputs.electricityUsage) * 0.5 +
      parseFloat(inputs.gasUsage) * 2 +
      parseFloat(inputs.carTravel) * 0.3 +
      parseFloat(inputs.flightHours) * 90 +
      parseFloat(inputs.meatConsumption) * 10;

    setFootprintEstimate(total);
    setRecommendedOffsets(Math.ceil(total / 1000));

    toast.success(`Your estimated carbon footprint is ${total.toFixed(1)} kg CO₂e`);
  };

  const handlePurchaseOffsets = async (tokenAmount) => {
    try {
      await web3Service.purchaseOffsets(tokenAmount);
      toast.success("Purchase successful!");
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Purchase failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-eco-light/30">
      <div className="container px-4 py-8 mx-auto max-w-6xl">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FootprintCalculator
              inputs={inputs}
              handleChange={handleChange}
              calculateFootprint={calculateFootprint}
              footprintEstimate={footprintEstimate}
              isLoading={isLoading}
            />
            <OffsetPurchase
              tokenPrice={tokenPrice}
              recommendedOffsets={recommendedOffsets}
              account={account}
              purchaseOffsets={handlePurchaseOffsets}
              isLoading={isLoading}
            />
          </div>
          <div className="space-y-6">
            <WalletCard
              account={account}
              ethBalance={ethBalance}
              tokenBalance={tokenBalance}
              connectWallet={handleConnectWallet}
              isLoading={isLoading}
            />
            <CarbonInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;