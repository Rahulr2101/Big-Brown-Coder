import Web3 from "web3";
import CarbonOffsetToken from "../assets/CarbonOffsetToken.json";

class Web3Service {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    this.contractABI = CarbonOffsetToken.abi;
    this.contractAddress = null;
    this.isInitialized = false;
    this.defaultTokenPrice = "0.01";
  }

  async init() {
    if (this.isInitialized) return true;
    if (!window.ethereum) {
      console.error("No Ethereum provider found. Please install MetaMask.");
      return false;
    }

    try {
      this.web3 = new Web3(window.ethereum);
      const networkId = await this.web3.eth.net.getId();

      // Check if contract exists on this network
      if (CarbonOffsetToken.networks && CarbonOffsetToken.networks[networkId]) {
        this.contractAddress = CarbonOffsetToken.networks[networkId].address;
        this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
      } else {
        console.warn(`Contract not found on network ID: ${networkId}. Using placeholder contract functionality.`);
        // Still allow the app to function without the contract
        this.isInitialized = true;
        return true;
      }

      window.ethereum.on("accountsChanged", (accounts) => {
        this.account = accounts[0] || null;
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing Web3Service:", error);
      return false;
    }
  }

  async getEthBalance(account) {
    if (!this.web3 || !account) {
      throw new Error("Web3 not initialized or account not connected.");
    }
    try {
      const balance = await this.web3.eth.getBalance(account);
      return this.web3.utils.fromWei(balance, "ether");
    } catch (error) {
      console.error("Error getting ETH balance:", error);
      return "0";
    }
  }

  async getTokenBalance(account) {
    if (!this.contract || !account) {
      console.warn("Contract not initialized or account not connected.");
      return "0";
    }
    try {
      const balance = await this.contract.methods.balanceOf(account).call();
      return this.web3.utils.fromWei(balance, "ether");
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0";
    }
  }

  async getTokenPrice() {
    if (!this.contract) {
      console.warn("Contract not initialized, using default token price.");
      return this.defaultTokenPrice;
    }
    try {
      const price = await this.contract.methods.getTokenPrice().call();
      return this.web3.utils.fromWei(price, "ether");
    } catch (error) {
      console.error("Error getting token price:", error);
      return this.defaultTokenPrice;
    }
  }

  async connectWallet() {
    if (!this.isInitialized && !(await this.init())) {
      throw new Error("Failed to initialize Web3Service");
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) throw new Error("No accounts found.");

      this.account = accounts[0];
      
      // Get balances with error handling
      let ethBalance = "0";
      let tokenBalance = "0";
      
      try {
        ethBalance = await this.getEthBalance(this.account);
      } catch (error) {
        console.warn("Could not fetch ETH balance:", error);
      }
      
      try {
        tokenBalance = await this.getTokenBalance(this.account);
      } catch (error) {
        console.warn("Could not fetch token balance:", error);
      }
      
      return {
        account: this.account,
        ethBalance,
        tokenBalance
      };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  async purchaseOffsets(tokenAmount) {
    if (!this.isInitialized) {
      console.warn("Web3Service not initialized. Initializing now...");
      const initialized = await this.init();
      if (!initialized) throw new Error("Failed to initialize Web3Service.");
    }

    if (!this.contract) throw new Error("Smart contract not found. Make sure the contract is deployed on the selected network.");
    if (!this.account) throw new Error("No wallet connected. Please connect your wallet.");

    try {
      const pricePerToken = await this.getTokenPrice();
      const totalCost = this.web3.utils.toWei((tokenAmount * parseFloat(pricePerToken)).toString(), "ether");

      const tx = await this.contract.methods
        .purchaseOffsets(this.web3.utils.toWei(tokenAmount.toString(), "ether"))
        .send({ from: this.account, value: totalCost, gas: 300000 });

      return tx;
    } catch (error) {
      console.error("Error purchasing offsets:", error);
      throw error;
    }
  }
}

export default new Web3Service();