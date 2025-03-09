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
    // Updated path to properly locate the contract JSON
    const response = await fetch('/CarbonOffsetToken.json');
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
  document.getElementById('footprintCalculatorForm').addEventListener('submit', calculateAndUpdateFootprint);
  document.getElementById('purchaseForm').addEventListener('submit', purchaseOffsets);
  
  // Update displays on input
  document.getElementById('tokenAmount').addEventListener('input', calculateTotalCost);
  document.querySelectorAll('.carbon-input').forEach(input => {
    input.addEventListener('input', updateFootprintEstimate);
  });
  
  // Set up explanations
  setupExplanations();
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
    
    // Display footprint history
    await displayFootprintHistory();
  } catch (error) {
    console.error('Error updating UI:', error);
    showStatus('Error fetching data from blockchain', 'danger');
  }
}

// Calculate carbon footprint based on user inputs
function calculateFootprint() {
  // Get values from form
  const electricity = parseFloat(document.getElementById('electricityUsage').value) || 0;
  const gas = parseFloat(document.getElementById('gasUsage').value) || 0;
  const carKm = parseFloat(document.getElementById('carTravel').value) || 0;
  const flightHours = parseFloat(document.getElementById('flightHours').value) || 0;
  const meatConsumption = parseFloat(document.getElementById('meatConsumption').value) || 0;
  
  // Carbon factors (kg CO2 per unit)
  const ELECTRICITY_FACTOR = 0.5; // per kWh
  const GAS_FACTOR = 2.0; // per cubic meter
  const CAR_FACTOR = 0.2; // per km
  const FLIGHT_FACTOR = 100; // per hour
  const MEAT_FACTOR = 6; // per kg
  
  // Calculate total footprint
  const totalFootprint = (
    electricity * ELECTRICITY_FACTOR +
    gas * GAS_FACTOR +
    carKm * CAR_FACTOR +
    flightHours * FLIGHT_FACTOR +
    meatConsumption * MEAT_FACTOR
  ).toFixed(2);
  
  return totalFootprint;
}

// Update footprint estimate in real-time as user enters data
function updateFootprintEstimate() {
  const footprint = calculateFootprint();
  document.getElementById('footprintEstimate').textContent = footprint;
  
  // Update the footprint comparison
  updateFootprintComparison(footprint);
  
  // Show carbon saving tips based on inputs
  showCarbonSavingTips();
}

// Show users how their footprint compares to averages
function updateFootprintComparison(footprint) {
  const comparison = document.getElementById('footprintComparison');
  const value = parseFloat(footprint);
  
  if (value < 1000) {
    comparison.textContent = "Your footprint is well below average! Great job!";
    comparison.className = "text-success";
  } else if (value < 5000) {
    comparison.textContent = "Your footprint is about average.";
    comparison.className = "text-warning";
  } else {
    comparison.textContent = "Your footprint is above average. Consider reducing your carbon impact.";
    comparison.className = "text-danger";
  }
}

// Calculate and then update the user's footprint in the contract
async function calculateAndUpdateFootprint(event) {
  event.preventDefault();
  
  if (!contract || !userAccount) {
    showStatus('Please connect your wallet first', 'warning');
    return;
  }
  
  const footprint = calculateFootprint();
  
  try {
    showStatus('Updating carbon footprint...');
    await contract.methods.updateCarbonFootprint(footprint).send({ from: userAccount });
    showStatus('Carbon footprint updated successfully!', 'success');
    
    // Show the offset recommendation
    recommendOffsets(footprint);
    
    updateUI();
  } catch (error) {
    console.error('Error updating footprint:', error);
    showStatus('Failed to update carbon footprint', 'danger');
  }
}

// Legacy function kept for compatibility
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
    
    // Calculate environmental impact
    const impactElement = document.getElementById('environmentalImpact');
    if (impactElement) {
      // Each token offsets approximately 1 ton of CO2
      const impact = (tokenAmount * 1000).toFixed(0);
      impactElement.textContent = `Your purchase will offset approximately ${impact} kg of CO2!`;
    }
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

// Recommend offset amount based on footprint
function recommendOffsets(footprint) {
  const recommendedOffsets = Math.ceil(parseFloat(footprint) / 1000);
  document.getElementById('recommendedOffsets').textContent = recommendedOffsets;
  document.getElementById('offsetRecommendation').style.display = 'block';
  
  // Auto-fill the purchase form with the recommendation
  document.getElementById('tokenAmount').value = recommendedOffsets;
  calculateTotalCost();
}

// Add information tooltips and explanations
function setupExplanations() {
  const explanations = {
    'electricityUsageHelp': 'Check your electricity bill for monthly kWh usage.',
    'gasUsageHelp': 'Natural gas usage in cubic meters per month.',
    'carTravelHelp': 'Estimated kilometers driven per month.',
    'flightHoursHelp': 'Total flight hours per year divided by 12 for monthly average.',
    'meatConsumptionHelp': 'Kilograms of meat consumed per month.',
    'offsetExplanation': 'Carbon offsets fund projects that reduce greenhouse gas emissions, like renewable energy or reforestation efforts.'
  };
  
  // Add help text to each field
  for (const [id, text] of Object.entries(explanations)) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }
}

// Add carbon saving tips based on user's inputs
function showCarbonSavingTips() {
  const electricity = parseFloat(document.getElementById('electricityUsage').value) || 0;
  const carKm = parseFloat(document.getElementById('carTravel').value) || 0;
  const flightHours = parseFloat(document.getElementById('flightHours').value) || 0;
  const meatConsumption = parseFloat(document.getElementById('meatConsumption').value) || 0;
  
  const tipsContainer = document.getElementById('carbonSavingTips');
  if (!tipsContainer) return;
  
  tipsContainer.innerHTML = '';
  
  const tips = [];
  
  if (electricity > 300) {
    tips.push('Consider switching to energy-efficient LED bulbs to reduce electricity usage.');
    tips.push('Unplug electronics when not in use to prevent phantom energy usage.');
  }
  
  if (carKm > 500) {
    tips.push('Try carpooling or public transport to reduce your driving emissions.');
    tips.push('Consider a hybrid or electric vehicle for your next car purchase.');
  }
  
  if (flightHours > 5) {
    tips.push('Consider carbon offsetting your flights specifically.');
    tips.push('For shorter trips, consider trains which have much lower emissions than planes.');
  }
  
  if (meatConsumption > 10) {
    tips.push('Reducing red meat consumption can significantly lower your carbon footprint.');
    tips.push('Try meat-free Mondays as a simple way to reduce impact.');
  }
  
  // Add the tips to the container
  if (tips.length > 0) {
    const tipsList = document.createElement('ul');
    tips.forEach(tip => {
      const listItem = document.createElement('li');
      listItem.textContent = tip;
      tipsList.appendChild(listItem);
    });
    
    tipsContainer.appendChild(document.createElement('h5')).textContent = 'Carbon Reduction Tips';
    tipsContainer.appendChild(tipsList);
    tipsContainer.style.display = 'block';
  } else {
    tipsContainer.style.display = 'none';
  }
}

// Add historical data tracking
async function displayFootprintHistory() {
  if (!contract || !userAccount) return;
  
  try {
    const historyContainer = document.getElementById('footprintHistory');
    if (!historyContainer) return;
    
    // Get current footprint from contract
    const currentFootprint = await contract.methods.userCarbonFootprints(userAccount).call();
    
    // Store the current reading with timestamp
    const history = JSON.parse(localStorage.getItem('footprintHistory') || '[]');
    
    // Check if this is a new entry
    const lastEntry = history.length > 0 ? history[history.length - 1] : null;
    if (!lastEntry || lastEntry.footprint !== currentFootprint) {
      history.push({
        timestamp: new Date().toISOString(),
        footprint: currentFootprint
      });
      localStorage.setItem('footprintHistory', JSON.stringify(history));
    }
    
    // Display the history
    historyContainer.innerHTML = '<h5>Your Footprint History</h5>';
    
    if (history.length === 0) {
      historyContainer.innerHTML += '<p>No history yet. Calculate your footprint to start tracking!</p>';
      return;
    }
    
    const historyList = document.createElement('ul');
    history.slice(-5).forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      const item = document.createElement('li');
      item.textContent = `${date}: ${entry.footprint} kg CO2`;
      historyList.appendChild(item);
    });
    
    historyContainer.appendChild(historyList);
    
    // Display trend if we have enough data
    if (history.length >= 2) {
      const firstFootprint = parseFloat(history[0].footprint);
      const latestFootprint = parseFloat(history[history.length - 1].footprint);
      const difference = latestFootprint - firstFootprint;
      const percentChange = (difference / firstFootprint * 100).toFixed(1);
      
      const trend = document.createElement('p');
      if (difference < 0) {
        trend.className = 'text-success';
        trend.textContent = `Great job! You've reduced your carbon footprint by ${Math.abs(percentChange)}% since you started.`;
      } else if (difference > 0) {
        trend.className = 'text-warning';
        trend.textContent = `Your carbon footprint has increased by ${percentChange}% since you started.`;
      } else {
        trend.textContent = 'Your carbon footprint has remained stable.';
      }
      historyContainer.appendChild(trend);
    }
  } catch (error) {
    console.error('Error displaying history:', error);
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