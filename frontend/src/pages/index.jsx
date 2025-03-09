import React, { useState, useEffect } from "react";

import Header from "@/components/Header";
import WalletCard from "@/components/WalletCard";
import FootprintCalculator from "@/components/FootprintCalculator";
import OffsetPurchase from "@/components/OffsetPurchase";
import CarbonInfo from "@/components/CarbonInfo";

const Index = () => {

  const [web3Enabled, setWeb3Enabled] = useState(false);
  const [account, setAccount] = useState("Not connected");
  const [ethBalance, setEthBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0.01);
  const [footprintEstimate, setFootprintEstimate] = useState(0);
  const [recommendedOffsets, setRecommendedOffsets] = useState(0);
  const [inputs, setInputs] = useState({
    electricityUsage: "",
    gasUsage: "",
    carTravel: "",
    flightHours: "",
    meatConsumption: "",
  });

  useEffect(() => {
    const checkWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Modern browsers with Ethereum provider
          const Web3 = (await import("web3")).default;
          window.web3 = new Web3(window.ethereum);
          setWeb3Enabled(true);
          
          // Check if already connected
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error("Error initializing Web3:", error);
          toast({
            title: "Web3 Connection Error",
            description: "Failed to initialize Web3 connection",
            variant: "destructive",
          });
        }
      } else {
        console.log("Non-Ethereum browser detected.");
        toast({
          title: "Wallet Not Detected",
          description: "Please install MetaMask to use all features",
          variant: "destructive",
        });
        setWeb3Enabled(false);
      }
    };
    
    checkWeb3();
  }, []);

  const connectWallet = async () => {
    if (web3Enabled) {
      try {
        const Web3 = (await import("web3")).default;
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        
        setAccount(accounts[0]);
        const web3 = new Web3(window.ethereum);
        const balance = await web3.eth.getBalance(accounts[0]);
        setEthBalance(web3.utils.fromWei(balance, "ether"));
        
        // Mock token balance for now - would come from smart contract
        setTokenBalance(Math.floor(Math.random() * 5));
        
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected",
        });
      } catch (error) {
        console.error("Error connecting wallet:", error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect your wallet. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Web3 Not Available",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const calculateFootprint = (e) => {
    e.preventDefault();
    
    const electricityEmissions = Number(inputs.electricityUsage) * 0.5;
    const gasEmissions = Number(inputs.gasUsage) * 2;
    const carEmissions = Number(inputs.carTravel) * 0.2;
    const flightEmissions = Number(inputs.flightHours) * 90;
    const meatEmissions = Number(inputs.meatConsumption) * 7;
    
    const total = 
      electricityEmissions +
      gasEmissions +
      carEmissions +
      flightEmissions +
      meatEmissions;
    
    setFootprintEstimate(total);
    
    // 1 carbon offset token = 1,000 kg CO2
    const offsetsNeeded = Math.ceil(total / 1000);
    setRecommendedOffsets(offsetsNeeded > 0 ? offsetsNeeded : 1);
    
    toast({
      title: "Footprint Calculated",
      description: `Your estimated carbon footprint is ${total.toFixed(1)} kg CO₂e`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-eco-light/30">
      <div className="container px-4 py-8 mx-auto max-w-6xl">
      
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FootprintCalculator
              inputs={inputs}
              handleChange={handleChange}
              calculateFootprint={calculateFootprint}
              footprintEstimate={footprintEstimate}
            />
            
            <OffsetPurchase
              tokenPrice={tokenPrice}
              recommendedOffsets={recommendedOffsets}
              account={account}
            />
          </div>
          
          <div className="space-y-6">
            <WalletCard
              account={account}
              ethBalance={ethBalance}
              tokenBalance={tokenBalance}
              connectWallet={connectWallet}
            />
            
            <CarbonInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
