// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CarbonOffsetToken
 * @dev ERC20 token representing carbon offsets
 */
contract CarbonOffsetToken is ERC20, Ownable {
    // Price of 1 carbon offset token in wei
    uint256 public tokenPrice;
    
    // Mapping to store user carbon footprints
    mapping(address => uint256) public userCarbonFootprints;
    
    // Event emitted when a user updates their carbon footprint
    event CarbonFootprintUpdated(address indexed user, uint256 amount);
    
    // Event emitted when a user purchases carbon offsets
    event CarbonOffsetPurchased(address indexed user, uint256 amount, uint256 cost);

    /**
     * @dev Constructor that gives the msg.sender all initial tokens
     * @param initialSupply The initial supply of tokens
     * @param initialPrice The initial price of one token in wei
     */
    constructor(uint256 initialSupply, uint256 initialPrice) ERC20("CarbonOffset", "CO2") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * (10 ** decimals()));
        tokenPrice = initialPrice;
    }
    
    /**
     * @dev Update the carbon footprint for a user
     * @param amount The carbon footprint in kg CO2
     */
    function updateCarbonFootprint(uint256 amount) external {
        userCarbonFootprints[msg.sender] = amount;
        emit CarbonFootprintUpdated(msg.sender, amount);
    }
    
    /**
     * @dev Purchase carbon offset tokens
     * @param tokenAmount The amount of tokens to purchase
     */
    function purchaseOffsets(uint256 tokenAmount) external payable {
        // Calculate the cost
        uint256 cost = tokenAmount * tokenPrice;
        
        // Check if enough ETH was sent
        require(msg.value >= cost, "Insufficient ETH sent");
        
        // Transfer tokens from contract owner to the buyer
        _transfer(owner(), msg.sender, tokenAmount * (10 ** decimals()));
        
        // Emit purchase event
        emit CarbonOffsetPurchased(msg.sender, tokenAmount, cost);
        
        // Return excess ETH if any
        if (msg.value > cost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - cost}("");
            require(success, "Failed to return excess ETH");
        }
    }
    
    /**
     * @dev Set a new token price
     * @param newPrice The new price in wei
     */
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        tokenPrice = newPrice;
    }
    
    /**
     * @dev Allows the owner to withdraw accumulated ETH
     */
    function withdrawFunds() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}