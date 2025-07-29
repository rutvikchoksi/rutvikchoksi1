// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @dev A simple ERC20 token for testing delegation functionality
 */
contract MockERC20 is ERC20 {
    constructor() ERC20("Test Token", "TEST") {
        // Mint 1 million tokens to the deployer
        _mint(msg.sender, 1000000 * 10**18);
    }

    /**
     * @dev Mint tokens to any address (for testing purposes)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from any address (for testing purposes)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}