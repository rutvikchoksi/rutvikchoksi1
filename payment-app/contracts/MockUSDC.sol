// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev A mock USDC token for testing payment functionality
 * This contract mimics the behavior of real USDC with 6 decimal places
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event PaymentSent(address indexed from, address indexed to, uint256 amount);

    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        // Mint initial supply to deployer (1 million USDC)
        _mint(msg.sender, 1000000 * 10**DECIMALS);
    }

    /**
     * @dev Returns the number of decimals used for USDC (6)
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @dev Mint tokens to any address (for testing purposes)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in smallest unit)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Mint tokens to multiple addresses (for easy setup)
     * @param recipients Array of addresses to mint tokens to
     * @param amounts Array of amounts to mint to each address
     */
    function mintBatch(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Enhanced transfer function with payment event
     * @param to Address to send tokens to
     * @param amount Amount of tokens to send
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        emit PaymentSent(owner, to, amount);
        return true;
    }

    /**
     * @dev Enhanced transferFrom function with payment event
     * @param from Address to send tokens from
     * @param to Address to send tokens to
     * @param amount Amount of tokens to send
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        emit PaymentSent(from, to, amount);
        return true;
    }

    /**
     * @dev Get balance in human readable format (with decimals)
     * @param account Address to check balance for
     * @return balance in USDC (not smallest unit)
     */
    function getBalanceFormatted(address account) external view returns (uint256) {
        return balanceOf(account) / 10**DECIMALS;
    }

    /**
     * @dev Convert human readable amount to smallest unit
     * @param humanAmount Amount in USDC (e.g., 100 for $100)
     * @return Amount in smallest unit
     */
    function toSmallestUnit(uint256 humanAmount) external pure returns (uint256) {
        return humanAmount * 10**DECIMALS;
    }

    /**
     * @dev Convert smallest unit to human readable amount
     * @param smallestUnitAmount Amount in smallest unit
     * @return Amount in USDC
     */
    function toHumanAmount(uint256 smallestUnitAmount) external pure returns (uint256) {
        return smallestUnitAmount / 10**DECIMALS;
    }

    /**
     * @dev Check if an account has sufficient balance for a payment
     * @param account Address to check
     * @param amount Amount to check (in smallest unit)
     * @return true if account has sufficient balance
     */
    function hasSufficientBalance(address account, uint256 amount) external view returns (bool) {
        return balanceOf(account) >= amount;
    }

    /**
     * @dev Get detailed account information
     * @param account Address to get info for
     * @return balance in smallest unit
     * @return formattedBalance in USDC
     */
    function getAccountInfo(address account) external view returns (uint256 balance, uint256 formattedBalance) {
        balance = balanceOf(account);
        formattedBalance = balance / 10**DECIMALS;
    }
}