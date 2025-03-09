// App.js - Frontend logic for Carbon Offset dApp

// Contract ABI will be filled after compilation
let contractABI = [];
// Contract address will be filled after deployment
let contractAddress = '';
let web3;
let contract;
let userAccount;

// Initialize the application
async function init() {
  showStatus('Initializing application...');
  
  // Load contract data from the build folder
  try {
    const response = await fetch('CarbonOffsetToken.json');
    const contractData = await response.json();
    contractABI = contractData.abi;
    contractAddress = contractData.networks[Object.keys(contractData.networks)[0]].address;
  } catch (error) {
    console.error('Failed to load contract data:', error);
    showStatus('Failed to load contract data. Make sure the contract is compiled and deployed.', 'danger');
    return;
  }
  
  // Set up the connect wallet button
  document.getElementById('connectWallet').addEventListener('click', connectWallet);
  
  // If MetaMask is already available, connect
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      // Request account access
      await connectWallet();
    } catch (error) {
      console.error('User denied account access');
    }
  } else {
    showStatus('Please install MetaMask to use this dApp', 'warning');
  }
  
  // Set up form event listeners
  document.getElementById('footprintForm').addEventListener('submit', updateFootprint);
  document.getElementById('purchaseForm').addEventListener('submit', purchaseOffsets);
  
  // Update token amount display on input
  document.getElementById('tokenAmount').addEventListener('input', calculateTotalCost);
}

// Connect to MetaMask wallet
async function connectWallet() {
  try {
    showStatus('Connecting to wallet...');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userAccount = accounts[0];
    document.getElementById('accountAddress').textContent = userAccount;
    
    // Initialize contract
    contract = new web3.eth.Contract(contractABI, contractAddress);
    
    // Setup account change listener
    window.ethereum.on('accountsChanged', (accounts) => {
      userAccount = accounts[0];
      document.getElementById('accountAddress').textContent = userAccount;
      updateUI();
    });
    
    // Update UI with current data
    await updateUI();
    showStatus('Wallet connected successfully!', 'success');
  } catch (error) {
    console.error('Error connecting wallet:', error);
    showStatus('Failed to connect wallet. Please try again.', 'danger');
  }
}

// Update the UI with current data
async function updateUI() {
  if (!contract || !userAccount) return;
  
  try {
    // Get ETH balance
    const balance = await web3.eth.getBalance(userAccount);
    document.getElementById('ethBalance').textContent = web3.utils.fromWei(balance, 'ether');
    
    // Get token balance
    const tokenBalance = await contract.methods.balanceOf(userAccount).call();
    document.getElementById('tokenBalance').textContent = web3.utils.fromWei(tokenBalance, 'ether');
    
    // Get token price
    const tokenPrice = await contract.methods.tokenPrice().call();
    document.getElementById('tokenPrice').textContent = web3.utils.fromWei(tokenPrice, 'ether');
    
    // Get user carbon footprint
    const footprint = await contract.methods.userCarbonFootprints(userAccount).call();
    document.getElementById('currentFootprint').textContent = footprint;
  } catch (error) {
    console.error('Error updating UI:', error);
    showStatus('Error fetching data from blockchain', 'danger');
  }
}

// Update carbon footprint
async function updateFootprint(event) {
  event.preventDefault();
  
  if (!contract || !userAccount) {
    showStatus('Please connect your wallet first', 'warning');
    return;
  }
  
  const amount = document.getElementById('carbonAmount').value;
  
  try {
    showStatus('Updating carbon footprint...');
    await contract.methods.updateCarbonFootprint(amount).send({ from: userAccount });
    showStatus('Carbon footprint updated successfully!', 'success');
    updateUI();
  } catch (error) {
    console.error('Error updating footprint:', error);
    showStatus('Failed to update carbon footprint', 'danger');
  }
}

// Calculate total cost when token amount changes
async function calculateTotalCost() {
  if (!contract) return;
  
  try {
    const tokenAmount = document.getElementById('tokenAmount').value || 0;
    const tokenPrice = await contract.methods.tokenPrice().call();
    const totalCost = web3.utils.toBN(tokenAmount).mul(web3.utils.toBN(tokenPrice));
    document.getElementById('totalCost').textContent = web3.utils.fromWei(totalCost.toString(), 'ether');
  } catch (error) {
    console.error('Error calculating cost:', error);
  }
}

// Purchase carbon offsets
async function purchaseOffsets(event) {
  event.preventDefault();
  
  if (!contract || !userAccount) {
    showStatus('Please connect your wallet first', 'warning');
    return;
  }
  
  const tokenAmount = document.getElementById('tokenAmount').value;
  
  try {
    showStatus('Purchasing carbon offsets...');
    const tokenPrice = await contract.methods.tokenPrice().call();
    const totalCost = web3.utils.toBN(tokenAmount).mul(web3.utils.toBN(tokenPrice));
    
    await contract.methods.purchaseOffsets(tokenAmount).send({ 
      from: userAccount,
      value: totalCost.toString()
    });
    
    showStatus('Carbon offsets purchased successfully!', 'success');
    updateUI();
  } catch (error) {
    console.error('Error purchasing offsets:', error);
    showStatus('Failed to purchase carbon offsets', 'danger');
  }
}

// Display status messages
function showStatus(message, type = 'info') {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.className = `alert alert-${type} mt-3`;
  statusElement.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 5000);
}

// Initialize the app when page loads
window.addEventListener('DOMContentLoaded', init);